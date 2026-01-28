import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
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
  total_price: number;
  special_requests?: string;
  status: string;
  total_nights: number;
  created_at: string;
  updated_at: string;
  villa_title: string;
  villa_slug: string;
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
  created_at: string;
  updated_at: string;
  villa?: Array<{ title?: string | null; slug?: string | null }> | null;
}

// GET - Fetch all bookings
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const villaIdParam = searchParams.get('villa_id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('bookings')
      .select(
        'id, villa_id, guest_name, guest_email, guest_phone, check_in_date, check_out_date, num_guests, total_price, special_requests, status, created_at, updated_at, villa: villa_types(title, slug)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (villaIdParam) {
      const villaId = Number(villaIdParam);
      if (!Number.isNaN(villaId)) {
        query = query.eq('villa_id', villaId);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const rows: BookingWithVilla[] = (data ?? []).map((booking: BookingRow) => {
      const villaInfo = booking.villa?.[0];
      const checkInDate = booking.check_in_date;
      const checkOutDate = booking.check_out_date;
      const totalNights = Math.ceil(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: booking.id,
        villa_id: booking.villa_id,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        guest_phone: booking.guest_phone,
        check_in: checkInDate,
        check_out: checkOutDate,
        guests_count: booking.num_guests,
        total_price: booking.total_price,
        special_requests: booking.special_requests || undefined,
        status: booking.status,
        total_nights: totalNights,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        villa_title: villaInfo?.title || '',
        villa_slug: villaInfo?.slug || ''
      };
    });

    const total = count ?? rows.length;

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

    const supabase = getSupabaseAdmin();

    // Calculate total nights and price
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const total_nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // Get villa price
    const { data: villaRow, error: villaError } = await supabase
      .from('villa_types')
      .select('price')
      .eq('id', villa_id)
      .maybeSingle<{ price: number }>();

    if (villaError) {
      throw new Error(villaError.message);
    }

    if (!villaRow) {
      return NextResponse.json({ success: false, error: 'Villa not found' }, { status: 404 });
    }

    const total_price = villaRow.price * total_nights;

    // Check for conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('bookings')
      .select('id')
      .eq('villa_id', villa_id)
      .in('status', ['confirmed', 'pending'])
      .or(
        `and(check_in_date.lte.${check_in},check_out_date.gt.${check_in}),` +
          `and(check_in_date.lt.${check_out},check_out_date.gte.${check_out})`
      );

    if (conflictError) {
      throw new Error(conflictError.message);
    }

    if ((conflicts ?? []).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Villa is not available for the selected dates' },
        { status: 400 }
      );
    }

    const { data: createdBooking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        villa_id,
        guest_name,
        guest_email,
        guest_phone,
        check_in_date: check_in,
        check_out_date: check_out,
        num_guests: guests_count,
        total_price,
        special_requests,
        status
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    const bookingId = createdBooking?.id;

    return NextResponse.json({
      success: true,
      data: { id: bookingId, total_nights, total_price, ...body }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
  }
});