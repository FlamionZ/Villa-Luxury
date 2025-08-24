import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

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
  check_in: Date;
  check_out: Date;
  guests_count: number;
  total_nights: number;
  total_price: number;
  special_requests?: string;
  status: string;
  booking_source: string;
  created_at: Date;
  villa_title: string;
  villa_slug: string;
  villa_price: number;
}

interface CurrentBooking extends RowDataPacket {
  villa_id: number;
  check_in: Date;
  check_out: Date;
}

interface VillaPrice extends RowDataPacket {
  price: number;
}

// GET - Fetch single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { id: bookingId } = await params;
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute<BookingWithVilla[]>(
      `SELECT b.*, v.title as villa_title, v.slug as villa_slug, v.price as villa_price
       FROM bookings b
       LEFT JOIN villa_types v ON b.villa_id = v.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch booking' }, { status: 500 });
  }
}

// PUT - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { id: bookingId } = await params;
    const body: Partial<BookingFormData> = await request.json();
    const connection = await getDbConnection();

    const updateFields: string[] = [];
    const values: (string | number)[] = [];

    // Build dynamic update query
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    // If check_in or check_out is being updated, recalculate total_nights and total_price
    if (body.check_in || body.check_out) {
      const [currentBooking] = await connection.execute<CurrentBooking[]>(
        'SELECT villa_id, check_in, check_out FROM bookings WHERE id = ?',
        [bookingId]
      );

      if (currentBooking.length > 0) {
        const current = currentBooking[0];
        const newCheckIn = body.check_in || current.check_in;
        const newCheckOut = body.check_out || current.check_out;

        const checkInDate = new Date(newCheckIn);
        const checkOutDate = new Date(newCheckOut);
        const total_nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

        // Get villa price
        const [villaRows] = await connection.execute<VillaPrice[]>('SELECT price FROM villa_types WHERE id = ?', [current.villa_id]);
        const villa_price = villaRows[0].price;
        const total_price = villa_price * total_nights;

        updateFields.push('total_nights = ?', 'total_price = ?');
        values.push(total_nights, total_price);
      }
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(bookingId);

    const query = `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`;
    await connection.execute(query, values);

    return NextResponse.json({ success: true, message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 });
  }
}

// DELETE - Delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { id: bookingId } = await params;
    const connection = await getDbConnection();

    await connection.execute('DELETE FROM bookings WHERE id = ?', [bookingId]);

    return NextResponse.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete booking' }, { status: 500 });
  }
}