import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

interface VillaRow extends RowDataPacket {
  id: number;
  slug: string;
  title: string;
  description: string;
  long_description?: string;
  price: number;
  weekday_price: number;
  weekend_price: number;
  high_season_price: number;
  location: string;
  size: string;
  max_guests: number;
  status: string;
  created_at: Date;
  amenities?: string;
  features?: string;
  images?: string;
}

export async function GET(request: NextRequest) {
  try {
    const connection = await getDbConnection();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status') || 'active';

    console.log('🔍 Fetching villas with optimized query...');
    const startTime = Date.now();

    // Step 1: Get basic villa data (fast with indexes)
    const villaQuery = `
      SELECT id, slug, title, description, long_description, price, 
             location, size, max_guests, status, created_at
      FROM villa_types
      WHERE status = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const [villas] = await connection.execute<VillaRow[]>(villaQuery, [status, parseInt(limit)]);
    
    if (villas.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No villas found'
      });
    }

    const villaIds = villas.map(v => v.id);
    const placeholders = villaIds.map(() => '?').join(',');

    // Step 2: Get primary images in one query (fast with new indexes)
    const imageQuery = `
      SELECT villa_id, image_url, alt_text
      FROM villa_images
      WHERE villa_id IN (${placeholders}) AND is_primary = 1
      ORDER BY villa_id
    `;

    const [images] = await connection.execute(imageQuery, villaIds);
    
    // Step 3: Get amenities in one query (fast with new indexes)  
    const amenityQuery = `
      SELECT villa_id, icon, text
      FROM villa_amenities
      WHERE villa_id IN (${placeholders})
      ORDER BY villa_id
    `;

    const [amenities] = await connection.execute(amenityQuery, villaIds);

    // Step 4: Get features in one query (fast with new indexes)
    const featureQuery = `
      SELECT villa_id, feature_text
      FROM villa_features  
      WHERE villa_id IN (${placeholders})
      ORDER BY villa_id
    `;

    const [features] = await connection.execute(featureQuery, villaIds);

    // Group data by villa_id for efficient lookup
    const imageMap = new Map();
    const amenityMap = new Map();
    const featureMap = new Map();

    (images as any[]).forEach((img: any) => {
      imageMap.set(img.villa_id, img.image_url);
    });

    (amenities as any[]).forEach((amenity: any) => {
      if (!amenityMap.has(amenity.villa_id)) {
        amenityMap.set(amenity.villa_id, []);
      }
      amenityMap.get(amenity.villa_id).push({
        icon: amenity.icon || 'fas fa-star',
        text: amenity.text
      });
    });

    (features as any[]).forEach((feature: any) => {
      if (!featureMap.has(feature.villa_id)) {
        featureMap.set(feature.villa_id, []);
      }
      featureMap.get(feature.villa_id).push(feature.feature_text);
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
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}