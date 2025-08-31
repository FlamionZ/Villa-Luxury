import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Villa extends RowDataPacket {
  id: number;
  name: string;
  price_per_night: number;
  max_guests: number;
  is_active: boolean;
}

interface ExistingBooking extends RowDataPacket {
  id: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      villa_id,
      guest_name,
      guest_email,
      guest_phone,
      check_in_date,
      check_out_date,
      number_of_guests,
      special_requests
    } = body;

    // Validate required fields
    if (!villa_id || !guest_name || !guest_email || !guest_phone || !check_in_date || !check_out_date || !number_of_guests) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guest_email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return NextResponse.json(
        { success: false, error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    const db = await getDbConnection();

    // Check if villa exists and is active
    const [villas] = await db.execute<Villa[]>(
      'SELECT id, name, max_guests, price_per_night, is_active FROM villa_types WHERE id = ? AND is_active = TRUE',
      [villa_id]
    );

    if (!Array.isArray(villas) || villas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Villa not found or not available' },
        { status: 404 }
      );
    }

    const villa = villas[0];

    // Check if number of guests exceeds villa capacity
    if (number_of_guests > villa.max_guests) {
      return NextResponse.json(
        { success: false, error: `Maximum ${villa.max_guests} guests allowed for this villa` },
        { status: 400 }
      );
    }

    // Check availability (no overlapping bookings for the same villa)
    const [existingBookings] = await db.execute(
      `SELECT id FROM bookings 
       WHERE villa_id = ? 
       AND status NOT IN ('cancelled', 'rejected')
       AND (
         (check_in_date <= ? AND check_out_date > ?) OR
         (check_in_date < ? AND check_out_date >= ?) OR
         (check_in_date >= ? AND check_out_date <= ?)
       )`,
      [villa_id, check_in_date, check_in_date, check_out_date, check_out_date, check_in_date, check_out_date]
    );

    if (Array.isArray(existingBookings) && existingBookings.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Villa is not available for the selected dates' },
        { status: 409 }
      );
    }

    // Calculate total days and price
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalPrice = totalDays * villa.price_per_night;

    // Create booking
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO bookings (
        villa_id, guest_name, guest_email, guest_phone, 
        check_in_date, check_out_date, number_of_guests, 
        total_price, special_requests, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        villa_id, guest_name, guest_email, guest_phone,
        check_in_date, check_out_date, number_of_guests,
        totalPrice, special_requests || null
      ]
    );

    const bookingId = result.insertId;

    return NextResponse.json({
      success: true,
      data: {
        booking_id: bookingId,
        villa_name: villa.name,
        total_days: totalDays,
        total_price: totalPrice,
        status: 'pending'
      },
      message: 'Booking created successfully. We will contact you soon to confirm your reservation.'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}