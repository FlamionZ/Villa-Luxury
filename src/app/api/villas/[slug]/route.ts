import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

interface VillaDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  price: number;
  weekday_price: number;
  weekend_price: number;
  high_season_price: number;
  location: string;
  size: string;
  max_guests: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface VillaAmenity {
  icon: string;
  text: string;
}

interface VillaFeature {
  feature_text: string;
}

interface VillaImage {
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = getSupabaseAdmin();

    // Get villa basic info
    const { data: villa, error: villaError } = await supabase
      .from('villa_types')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle<VillaDetail>();

    if (villaError) {
      throw new Error(villaError.message);
    }

    if (!villa) {
      return NextResponse.json({
        success: false,
        message: 'Villa tidak ditemukan'
      }, { status: 404 });
    }

    // Get amenities
    const { data: amenityRows, error: amenityError } = await supabase
      .from('villa_amenities')
      .select('icon, text')
      .eq('villa_id', villa.id)
      .order('id', { ascending: true });

    if (amenityError) {
      throw new Error(amenityError.message);
    }

    // Get features
    const { data: featureRows, error: featureError } = await supabase
      .from('villa_features')
      .select('feature_text')
      .eq('villa_id', villa.id)
      .order('id', { ascending: true });

    if (featureError) {
      throw new Error(featureError.message);
    }

    // Get images
    const { data: imageRows, error: imageError } = await supabase
      .from('villa_images')
      .select('image_url, alt_text, is_primary, sort_order')
      .eq('villa_id', villa.id)
      .order('sort_order', { ascending: true })
      .order('is_primary', { ascending: false });

    if (imageError) {
      throw new Error(imageError.message);
    }

    // Format amenities
    const amenities = (amenityRows ?? []).map(amenity => ({
      icon: amenity.icon,
      text: amenity.text
    }));

    // Format features
    const features = (featureRows ?? []).map(feature => feature.feature_text);

    // Format images
    const images = imageRows && imageRows.length > 0 
      ? imageRows.map(img => img.image_url)
      : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

    const villaDetail = {
      id: villa.id,
      title: villa.title,
      slug: villa.slug,
      description: villa.description,
      longDescription: villa.long_description || villa.description,
      price: villa.price,
      weekday_price: villa.weekday_price,
      weekend_price: villa.weekend_price,
      high_season_price: villa.high_season_price,
      images: images,
      amenities: amenities,
      features: features,
      maxGuests: villa.max_guests,
      bedrooms: amenities.find(a => a.text.includes('Kamar Tidur'))?.text.split(' ')[0] || '2',
      bathrooms: amenities.find(a => a.text.includes('Kamar Mandi'))?.text.split(' ')[0] || '2',
      location: villa.location,
      status: villa.status,
      createdAt: villa.created_at,
      updatedAt: villa.updated_at
    };

    return NextResponse.json({
      success: true,
      data: villaDetail
    });

  } catch (error) {
    console.error('Error fetching villa detail:', error);
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan server'
    }, { status: 500 });
  }
}