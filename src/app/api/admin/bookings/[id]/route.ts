import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

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

interface BookingWithVilla {
  id: number;
  villa_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_nights: number;
  total_price: number;
  special_requests?: string;
  status: string;
  booking_source: string;
  created_at: string;
  villa_title: string;
  villa_slug: string;
  villa_price: number;
}

interface CurrentBooking {
  villa_id: number;
  check_in_date: string;
  check_out_date: string;
}

interface VillaPrice {
  price: number;
}

interface BookingRow {
  id: number;
  villa_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_price: number;
  special_requests?: string | null;
  status: string;
  booking_source: string | null;
  created_at: string;
  villa?: { title?: string | null; slug?: string | null; price?: number | null } | null;
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
    const supabase = getSupabaseAdmin();

    const { data: row, error } = await supabase
      .from('bookings')
      .select(
        'id, villa_id, guest_name, guest_email, guest_phone, check_in_date, check_out_date, num_guests, total_price, special_requests, status, booking_source, created_at, villa: villa_types(title, slug, price)'
      )
      .eq('id', bookingId)
      .maybeSingle<BookingRow>();

    if (error) {
      throw new Error(error.message);
    }

    if (!row) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const totalNights = Math.ceil(
      (new Date(row.check_out_date).getTime() - new Date(row.check_in_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const responseData: BookingWithVilla = {
      id: row.id,
      villa_id: row.villa_id,
      guest_name: row.guest_name,
      guest_email: row.guest_email,
      guest_phone: row.guest_phone,
      check_in: row.check_in_date,
      check_out: row.check_out_date,
      guests_count: row.num_guests,
      total_nights: totalNights,
      total_price: row.total_price,
      special_requests: row.special_requests || undefined,
      status: row.status,
      booking_source: row.booking_source || 'website',
      created_at: row.created_at,
      villa_title: row.villa?.title || '',
      villa_slug: row.villa?.slug || '',
      villa_price: row.villa?.price || 0
    };

    return NextResponse.json({ success: true, data: responseData });
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
    const supabase = getSupabaseAdmin();

    const updatePayload: Record<string, string | number | boolean | null> = {};

    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || key === 'id') {
        return;
      }

      if (key === 'check_in') {
        updatePayload.check_in_date = value as string;
        return;
      }

      if (key === 'check_out') {
        updatePayload.check_out_date = value as string;
        return;
      }

      if (key === 'guests_count') {
        updatePayload.num_guests = value as number;
        return;
      }

      updatePayload[key] = value as string | number | boolean | null;
    });

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    // If check_in or check_out is being updated, recalculate total_nights and total_price
    if (body.check_in || body.check_out) {
      const { data: currentBooking, error: currentError } = await supabase
        .from('bookings')
        .select('villa_id, check_in_date, check_out_date')
        .eq('id', bookingId)
        .maybeSingle<CurrentBooking>();

      if (currentError) {
        throw new Error(currentError.message);
      }

      if (currentBooking) {
        const newCheckIn = body.check_in || currentBooking.check_in_date;
        const newCheckOut = body.check_out || currentBooking.check_out_date;

        const checkInDate = new Date(newCheckIn);
        const checkOutDate = new Date(newCheckOut);
        const total_nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

        const { data: villaRow, error: villaError } = await supabase
          .from('villa_types')
          .select('price')
          .eq('id', currentBooking.villa_id)
          .maybeSingle<VillaPrice>();

        if (villaError) {
          throw new Error(villaError.message);
        }

        const total_price = (villaRow?.price || 0) * total_nights;
        updatePayload.total_nights = total_nights;
        updatePayload.total_price = total_price;
      }
    }

    updatePayload.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', bookingId);

    if (updateError) {
      throw new Error(updateError.message);
    }

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
    const supabase = getSupabaseAdmin();

    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return NextResponse.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete booking' }, { status: 500 });
  }
}