import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

interface VillaRow {
  id: number;
  slug: string;
  title: string;
  description: string;
  long_description?: string;
  price: number;
  weekday_price?: number;
  weekend_price?: number;
  high_season_price?: number;
  location: string;
  size: string;
  max_guests: number;
  status: string;
  created_at: string;
}

interface ImageRow {
  villa_id: number;
  image_url: string;
  alt_text: string;
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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status') || 'active';

    console.log('🔍 Fetching villas with optimized query...');
    const startTime = Date.now();

    // Step 1: Get basic villa data
    const { data: villas, error: villasError } = await supabase
      .from('villa_types')
      .select('id, slug, title, description, long_description, price, weekday_price, weekend_price, high_season_price, location, size, max_guests, status, created_at')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (villasError) {
      throw new Error(villasError.message);
    }
    
    if (!villas || villas.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No villas found'
      });
    }

    const villaIds = villas.map(v => v.id);

    // Step 2: Get primary images in one query
    const { data: images, error: imageError } = await supabase
      .from('villa_images')
      .select('villa_id, image_url, alt_text')
      .in('villa_id', villaIds)
      .eq('is_primary', true)
      .order('villa_id', { ascending: true });

    if (imageError) {
      throw new Error(imageError.message);
    }
    
    // Step 3: Get amenities in one query
    const { data: amenities, error: amenityError } = await supabase
      .from('villa_amenities')
      .select('villa_id, icon, text')
      .in('villa_id', villaIds)
      .order('villa_id', { ascending: true });

    if (amenityError) {
      throw new Error(amenityError.message);
    }

    // Step 4: Get features in one query
    const { data: features, error: featureError } = await supabase
      .from('villa_features')
      .select('villa_id, feature_text')
      .in('villa_id', villaIds)
      .order('villa_id', { ascending: true });

    if (featureError) {
      throw new Error(featureError.message);
    }

    // Group data by villa_id for efficient lookup
    const imageMap = new Map<number, string>();
    const amenityMap = new Map<number, Array<{ icon: string; text: string }>>();
    const featureMap = new Map<number, string[]>();

    const safeImages = images ?? [];
    const safeAmenities = amenities ?? [];
    const safeFeatures = features ?? [];

    safeImages.forEach((img) => {
      imageMap.set(img.villa_id, img.image_url);
    });

    safeAmenities.forEach((amenity) => {
      if (!amenityMap.has(amenity.villa_id)) {
        amenityMap.set(amenity.villa_id, []);
      }
      amenityMap.get(amenity.villa_id)!.push({
        icon: amenity.icon || 'fas fa-star',
        text: amenity.text
      });
    });

    safeFeatures.forEach((feature) => {
      if (!featureMap.has(feature.villa_id)) {
        featureMap.set(feature.villa_id, []);
      }
      featureMap.get(feature.villa_id)!.push(feature.feature_text);
    });

    // Format the data for frontend use
    const formattedVillas = villas.map((villa) => {
      const primaryImage = imageMap.get(villa.id) || 
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

      return {
        id: villa.id,
        title: villa.title,
        slug: villa.slug,
        description: villa.description || villa.long_description,
        price: villa.price,
        image: primaryImage,
        amenities: amenityMap.get(villa.id) || [],
        features: featureMap.get(villa.id) || [],
        maxGuests: villa.max_guests || 2,
        bedrooms: Math.floor((villa.max_guests || 2) / 2),
        bathrooms: Math.ceil((villa.max_guests || 2) / 3),
        location: villa.location || '',
        status: villa.status
      };
    });

    const executionTime = Date.now() - startTime;
    console.log(`⚡ Optimized villa query completed in ${executionTime}ms`);

    return NextResponse.json({
      success: true,
      data: formattedVillas,
      performance: {
        executionTime: `${executionTime}ms`,
        villaCount: villas.length,
        optimized: true
      }
    });

  } catch (error) {
    console.error('Error fetching villas:', error);
    // Graceful fallback when database is unavailable so the homepage can still render
    const fallbackVillas = [
      {
        id: 1,
        title: 'Deluxe Villa',
        slug: 'deluxe-villa',
        description: 'Villa mewah dengan pemandangan taman tropis dan kolam renang pribadi.',
        price: 4500000,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        amenities: [
          { icon: 'fas fa-bed', text: '2 Kamar Tidur' },
          { icon: 'fas fa-bath', text: '2 Kamar Mandi' },
          { icon: 'fas fa-swimming-pool', text: 'Private Pool' }
        ],
        features: ['Private Pool', 'Garden View', '24/7 Service'],
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        location: 'Dieng Plateau',
        status: 'active'
      },
      {
        id: 2,
        title: 'Ocean View Villa',
        slug: 'ocean-view-villa',
        description: 'Villa premium dengan pemandangan laut yang menakjubkan dan akses pantai pribadi.',
        price: 6900000,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        amenities: [
          { icon: 'fas fa-bed', text: '3 Kamar Tidur' },
          { icon: 'fas fa-bath', text: '3 Kamar Mandi' },
          { icon: 'fas fa-water', text: 'Beach Access' }
        ],
        features: ['Ocean View', 'Beach Access', 'Butler Service'],
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 3,
        location: 'Batur Highland',
        status: 'active'
      },
      {
        id: 3,
        title: 'Presidential Suite',
        slug: 'presidential-suite',
        description: 'Suite mewah terluas dengan semua fasilitas premium dan butler pribadi.',
        price: 12000000,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        amenities: [
          { icon: 'fas fa-bed', text: '4 Kamar Tidur' },
          { icon: 'fas fa-bath', text: '4 Kamar Mandi' },
          { icon: 'fas fa-user-tie', text: 'Private Butler' }
        ],
        features: ['Butler Service', 'Helicopter Pad', 'Private Chef'],
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 4,
        location: 'Sumberejo Valley',
        status: 'active'
      }
    ];

    return NextResponse.json(
      {
        success: true,
        data: fallbackVillas,
        message: 'Using static fallback data because the database is unreachable.'
      },
      { status: 200 }
    );
  }
}