import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface BookingFormData {
  villa_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  special_requests?: string;
  status?: string;
  booking_source?: string;
}

interface BookingWithVilla extends RowDataPacket {
  id: number;
  villa_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  special_requests?: string;
  status: string;
  total_nights: number;
  created_at: Date;
  updated_at: Date;
  villa_title: string;
  villa_slug: string;
}

interface CountResult extends RowDataPacket {
  total: number;
}

interface VillaPrice extends RowDataPacket {
  price: number;
}

interface ConflictCheck extends RowDataPacket {
  id: number;
}

// GET - Fetch all bookings
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const villa_id = searchParams.get('villa_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const connection = await getDbConnection();

    let query = `
      SELECT 
        b.id, b.villa_id, b.guest_name, b.guest_email, b.guest_phone,
        b.check_in_date as check_in, b.check_out_date as check_out,
        b.num_guests as guests_count, b.total_price, b.special_requests, 
        b.status, b.created_at, b.updated_at,
        DATEDIFF(b.check_out_date, b.check_in_date) as total_nights,
        v.title as villa_title, v.slug as villa_slug
      FROM bookings b
      LEFT JOIN villa_types v ON b.villa_id = v.id
    `;
    
    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push('b.status = ?');
      params.push(status);
    }

    if (villa_id) {
      conditions.push('b.villa_id = ?');
      params.push(villa_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await connection.execute<BookingWithVilla[]>(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM bookings b';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    const [countResult] = await connection.execute<CountResult[]>(countQuery, params.slice(0, -2));
    const total = countResult[0].total;

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
});

// POST - Create new booking
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const body: BookingFormData = await request.json();
    const {
      villa_id, guest_name, guest_email, guest_phone, check_in, check_out,
      guests_count, special_requests, status = 'pending'
    } = body;

    const connection = await getDbConnection();

    // Calculate total nights and price
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const total_nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // Get villa price
    const [villaRows] = await connection.execute<VillaPrice[]>('SELECT price FROM villa_types WHERE id = ?', [villa_id]);
    if (villaRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Villa not found' }, { status: 404 });
    }
    
    const villa_price = villaRows[0].price;
    const total_price = villa_price * total_nights;

    // Check for conflicts
    const [conflicts] = await connection.execute<ConflictCheck[]>(
      `SELECT id FROM bookings 
       WHERE villa_id = ? 
       AND status IN ('confirmed', 'pending')
       AND ((check_in_date <= ? AND check_out_date > ?) OR (check_in_date < ? AND check_out_date >= ?))`,
      [villa_id, check_in, check_in, check_out, check_out]
    );

    if (conflicts.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Villa is not available for the selected dates' },
        { status: 400 }
      );
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO bookings (villa_id, guest_name, guest_email, guest_phone, check_in_date, check_out_date, 
                           num_guests, total_price, special_requests, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [villa_id, guest_name, guest_email, guest_phone, check_in, check_out,
       guests_count, total_price, special_requests, status]
    );

    const bookingId = result.insertId;

    return NextResponse.json({
      success: true,
      data: { id: bookingId, total_nights, total_price, ...body }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
  }
});