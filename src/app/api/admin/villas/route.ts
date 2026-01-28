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

// GET - Fetch all villas
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const supabase = getSupabaseAdmin();

    let villaQuery = supabase
      .from('villa_types')
      .select('id, slug, title, description, long_description, weekday_price, weekend_price, high_season_price, price, location, max_guests, status, created_at')
      .order('created_at', { ascending: false });

    if (status) {
      villaQuery = villaQuery.eq('status', status);
    }

    const { data: rows, error: villaError } = await villaQuery;

    if (villaError) {
      throw new Error(villaError.message);
    }

    const villaIds = (rows ?? []).map(row => row.id);

    const { data: amenities, error: amenityError } = await supabase
      .from('villa_amenities')
      .select('villa_id, icon, text')
      .in('villa_id', villaIds.length > 0 ? villaIds : [0])
      .order('villa_id', { ascending: true });

    if (amenityError) {
      throw new Error(amenityError.message);
    }

    const { data: features, error: featureError } = await supabase
      .from('villa_features')
      .select('villa_id, feature_text')
      .in('villa_id', villaIds.length > 0 ? villaIds : [0])
      .order('villa_id', { ascending: true });

    if (featureError) {
      throw new Error(featureError.message);
    }

    const { data: images, error: imageError } = await supabase
      .from('villa_images')
      .select('villa_id, image_url, alt_text, is_primary, sort_order')
      .in('villa_id', villaIds.length > 0 ? villaIds : [0])
      .order('villa_id', { ascending: true });

    if (imageError) {
      throw new Error(imageError.message);
    }

    const amenityMap = new Map<number, Array<{ icon: string; text: string }>>();
    const featureMap = new Map<number, string[]>();
    const imageMap = new Map<number, Array<{ image_url: string; alt_text: string; is_primary: boolean; sort_order: number }>>();

    (amenities ?? []).forEach(item => {
      if (!amenityMap.has(item.villa_id)) {
        amenityMap.set(item.villa_id, []);
      }
      amenityMap.get(item.villa_id)!.push({ icon: item.icon, text: item.text });
    });

    (features ?? []).forEach(item => {
      if (!featureMap.has(item.villa_id)) {
        featureMap.set(item.villa_id, []);
      }
      featureMap.get(item.villa_id)!.push(item.feature_text);
    });

    (images ?? []).forEach(item => {
      if (!imageMap.has(item.villa_id)) {
        imageMap.set(item.villa_id, []);
      }
      imageMap.get(item.villa_id)!.push({
        image_url: item.image_url,
        alt_text: item.alt_text,
        is_primary: !!item.is_primary,
        sort_order: item.sort_order
      });
    });

    const villas = (rows ?? []).map(row => ({
      ...row,
      amenities: amenityMap.get(row.id) || [],
      features: featureMap.get(row.id) || [],
      images: imageMap.get(row.id) || []
    }));
    
    return NextResponse.json({ success: true, data: villas });
  } catch (error) {
    console.error('Error fetching villas:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch villas' }, { status: 500 });
  }
}

// POST - Create new villa
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    let body: VillaFormData;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 400 });
    }
    const {
      slug, title, description, long_description, weekday_price, weekend_price, high_season_price, location, max_guests, status,
      amenities, features, images
    } = body;

    // Validate required fields
    const missingFields = [];
    if (!slug) missingFields.push('slug');
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!weekday_price) missingFields.push('weekday_price');
    if (!weekend_price) missingFields.push('weekend_price');
    if (!high_season_price) missingFields.push('high_season_price');
    if (!location) missingFields.push('location');
    if (!max_guests) missingFields.push('max_guests');

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: createdVilla, error: insertError } = await supabase
      .from('villa_types')
      .insert({
        slug,
        title,
        description,
        long_description: long_description || '',
        price: weekday_price,
        weekday_price,
        weekend_price,
        high_season_price,
        location,
        max_guests,
        status: status || 'active'
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    const villaId = createdVilla?.id;

    if (villaId) {
      if (amenities && amenities.length > 0) {
        const { error: amenityError } = await supabase
          .from('villa_amenities')
          .insert(amenities.map(amenity => ({
            villa_id: villaId,
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
            villa_id: villaId,
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
            villa_id: villaId,
            image_url: image.image_url,
            alt_text: image.alt_text,
            is_primary: image.is_primary,
            sort_order: index
          })));

        if (imageError) {
          throw new Error(imageError.message);
        }
      }
    }

    return NextResponse.json({ success: true, data: { id: villaId, ...body } });
  } catch (error) {
    console.error('Error creating villa:', error);
    const message = error instanceof Error ? error.message : 'Failed to create villa';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}