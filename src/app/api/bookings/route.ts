import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

interface Villa {
  id: number;
  title: string;
  price: number;
  max_guests: number;
  status: string;
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

    const supabase = getSupabaseAdmin();

    // Check if villa exists and is active
    const { data: villa, error: villaError } = await supabase
      .from('villa_types')
      .select('id, title, max_guests, price, status')
      .eq('id', villa_id)
      .eq('status', 'active')
      .maybeSingle<Villa>();

    if (villaError) {
      throw new Error(villaError.message);
    }

    if (!villa) {
      return NextResponse.json(
        { success: false, error: 'Villa not found or not available' },
        { status: 404 }
      );
    }

    // Check if number of guests exceeds villa capacity
    if (number_of_guests > villa.max_guests) {
      return NextResponse.json(
        { success: false, error: `Maximum ${villa.max_guests} guests allowed for this villa` },
        { status: 400 }
      );
    }

    // Check availability (no overlapping bookings for the same villa)
    const { data: existingBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('villa_id', villa_id)
      .not('status', 'in', '(cancelled,rejected)')
      .or(
        `and(check_in_date.lte.${check_in_date},check_out_date.gt.${check_in_date}),` +
          `and(check_in_date.lt.${check_out_date},check_out_date.gte.${check_out_date}),` +
          `and(check_in_date.gte.${check_in_date},check_out_date.lte.${check_out_date})`
      );

    if (bookingError) {
      throw new Error(bookingError.message);
    }

    if ((existingBookings ?? []).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Villa is not available for the selected dates' },
        { status: 409 }
      );
    }

    // Calculate total days and price
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalPrice = totalDays * villa.price;

    // Create booking
    const { data: createdBooking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        villa_id,
        guest_name,
        guest_email,
        guest_phone,
        check_in_date,
        check_out_date,
        num_guests: number_of_guests,
        total_price: totalPrice,
        special_requests: special_requests || null,
        status: 'pending'
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    const bookingId = createdBooking?.id;

    return NextResponse.json({
      success: true,
      data: {
        booking_id: bookingId,
        villa_name: villa.title,
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