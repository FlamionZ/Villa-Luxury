import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

interface VillaFormData {
  slug: string;
  title: string;
  description: string;
  long_description?: string;
  weekday_price: number;
  weekend_price: number;
  high_season_price: number;
  price?: number; // backward compatibility
  location: string;
  max_guests: number;
  status?: string;
  amenities?: Array<{ icon: string; text: string }>;
  features?: string[];
  images?: Array<{ image_url: string; alt_text: string; is_primary: boolean; sort_order: number }>;
}

interface VillaRow {
  id: number;
  slug: string;
  title: string;
  description: string;
  long_description?: string;
  weekday_price: number;
  weekend_price: number;
  high_season_price: number;
  price?: number; // backward compatibility
  location: string;
  max_guests: number;
  status: string;
  created_at: string;
}

interface BookingCheck {
  count: number;
}

interface AmenityRow {
  villa_id: number;
  icon: string;
  text: string;
}

interface FeatureRow {
  villa_id: number;
  feature_text: string;
}

interface ImageRow {
  villa_id: number;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

// GET - Fetch single villa
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

    const { id: villaId } = await params;
    const supabase = getSupabaseAdmin();

    const { data: villa, error: villaError } = await supabase
      .from('villa_types')
      .select('id, slug, title, description, long_description, weekday_price, weekend_price, high_season_price, price, location, max_guests, status, created_at')
      .eq('id', villaId)
      .maybeSingle<VillaRow>();

    if (villaError) {
      throw new Error(villaError.message);
    }

    if (!villa) {
      return NextResponse.json({ success: false, error: 'Villa not found' }, { status: 404 });
    }

    const { data: amenities, error: amenityError } = await supabase
      .from('villa_amenities')
      .select('villa_id, icon, text')
      .eq('villa_id', villa.id)
      .order('id', { ascending: true });

    if (amenityError) {
      throw new Error(amenityError.message);
    }

    const { data: features, error: featureError } = await supabase
      .from('villa_features')
      .select('villa_id, feature_text')
      .eq('villa_id', villa.id)
      .order('id', { ascending: true });

    if (featureError) {
      throw new Error(featureError.message);
    }

    const { data: images, error: imageError } = await supabase
      .from('villa_images')
      .select('villa_id, image_url, alt_text, is_primary, sort_order')
      .eq('villa_id', villa.id)
      .order('sort_order', { ascending: true })
      .order('is_primary', { ascending: false });

    if (imageError) {
      throw new Error(imageError.message);
    }

    const formattedVilla = {
      ...villa,
      amenities: (amenities ?? []).map((item: AmenityRow) => ({ icon: item.icon, text: item.text })),
      features: (features ?? []).map((item: FeatureRow) => item.feature_text),
      images: (images ?? []).map((item: ImageRow) => ({
        image_url: item.image_url,
        alt_text: item.alt_text,
        is_primary: !!item.is_primary,
        sort_order: item.sort_order
      }))
    };

    return NextResponse.json({ success: true, data: formattedVilla });
  } catch (error) {
    console.error('Error fetching villa:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch villa' }, { status: 500 });
  }
}

// PUT - Update villa
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

    const { id: villaId } = await params;
    const body: VillaFormData = await request.json();
    const {
      slug, title, description, long_description, weekday_price, weekend_price, high_season_price, location, max_guests, status,
      amenities, features, images
    } = body;
    const supabase = getSupabaseAdmin();

    const { error: updateError } = await supabase
      .from('villa_types')
      .update({
        slug,
        title,
        description,
        long_description: long_description || null,
        weekday_price,
        weekend_price,
        high_season_price,
        location,
        max_guests,
        status: status || 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', villaId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const { error: deleteAmenitiesError } = await supabase
      .from('villa_amenities')
      .delete()
      .eq('villa_id', villaId);

    if (deleteAmenitiesError) {
      throw new Error(deleteAmenitiesError.message);
    }

    const { error: deleteFeaturesError } = await supabase
      .from('villa_features')
      .delete()
      .eq('villa_id', villaId);

    if (deleteFeaturesError) {
      throw new Error(deleteFeaturesError.message);
    }

    const { error: deleteImagesError } = await supabase
      .from('villa_images')
      .delete()
      .eq('villa_id', villaId);

    if (deleteImagesError) {
      throw new Error(deleteImagesError.message);
    }

    if (amenities && amenities.length > 0) {
      const { error: amenityError } = await supabase
        .from('villa_amenities')
        .insert(amenities.map(amenity => ({
          villa_id: Number(villaId),
          icon: amenity.icon,
          text: amenity.text
        })));

      if (amenityError) {
        throw new Error(amenityError.message);
      }
    }

    if (features && features.length > 0) {
      const { error: featureError } = await supabase
        .from('villa_features')
        .insert(features.map(feature => ({
          villa_id: Number(villaId),
          feature_text: feature
        })));

      if (featureError) {
        throw new Error(featureError.message);
      }
    }

    if (images && images.length > 0) {
      const { error: imageError } = await supabase
        .from('villa_images')
        .insert(images.map((image, index) => ({
          villa_id: Number(villaId),
          image_url: image.image_url,
          alt_text: image.alt_text,
          is_primary: image.is_primary,
          sort_order: index
        })));

      if (imageError) {
        throw new Error(imageError.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Villa updated successfully' });
  } catch (error) {
    console.error('Error updating villa:', error);
    return NextResponse.json({ success: false, error: 'Failed to update villa' }, { status: 500 });
  }
}

// DELETE - Delete villa
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

    const { id: villaId } = await params;
    const supabase = getSupabaseAdmin();

    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('villa_id', villaId)
      .in('status', ['confirmed', 'pending']);

    if (bookingError) {
      throw new Error(bookingError.message);
    }

    const activeCount = bookings?.length ?? 0;

    if (activeCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete villa with active bookings' },
        { status: 400 }
      );
    }

    // Delete villa and all related data (cascade will handle amenities, features, images)
    const { error: deleteError } = await supabase
      .from('villa_types')
      .delete()
      .eq('id', villaId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return NextResponse.json({ success: true, message: 'Villa deleted successfully' });
  } catch (error) {
    console.error('Error deleting villa:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete villa' }, { status: 500 });
  }
}