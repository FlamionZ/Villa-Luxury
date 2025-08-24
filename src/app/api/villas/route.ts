import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const connection = await getDbConnection();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status') || 'active';

    // Query with joins to get related data (same as admin API)
    const query = `
      SELECT v.*, 
             GROUP_CONCAT(DISTINCT CONCAT(va.icon, '|||', va.text) SEPARATOR '^^^') as amenities,
             GROUP_CONCAT(DISTINCT vf.feature_text SEPARATOR '^^^') as features,
             GROUP_CONCAT(DISTINCT CONCAT(vi.image_url, '|||', vi.alt_text, '|||', vi.is_primary, '|||', vi.sort_order) SEPARATOR '^^^') as images
      FROM villa_types v
      LEFT JOIN villa_amenities va ON v.id = va.villa_id
      LEFT JOIN villa_features vf ON v.id = vf.villa_id
      LEFT JOIN villa_images vi ON v.id = vi.villa_id
      WHERE v.status = ?
      GROUP BY v.id 
      ORDER BY v.created_at DESC 
      LIMIT ?
    `;

    const [rows] = await connection.execute(query, [status, parseInt(limit)]);

    // Format the data for frontend use
    const formattedVillas = (rows as any[]).map((villa: any) => {
      // Parse amenities
      const amenities = villa.amenities ? villa.amenities.split('^^^').map((item: string) => {
        const [icon, text] = item.split('|||');
        return { icon: icon || 'fas fa-star', text: text || '' };
      }).filter((a: any) => a.text) : [];

      // Parse features
      const features = villa.features ? villa.features.split('^^^').filter((f: string) => f.trim()) : [];

      // Get primary image or first image
      let primaryImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
      if (villa.images) {
        const imageArray = villa.images.split('^^^');
        const primaryImg = imageArray.find((img: string) => img.split('|||')[2] === '1');
        if (primaryImg && primaryImg.split('|||')[0]) {
          primaryImage = primaryImg.split('|||')[0];
        } else if (imageArray.length > 0 && imageArray[0].split('|||')[0]) {
          primaryImage = imageArray[0].split('|||')[0];
        }
      }

      return {
        id: villa.id,
        title: villa.title,
        slug: villa.slug,
        description: villa.description || villa.long_description,
        price: parseFloat(villa.price),
        image: primaryImage,
        amenities: amenities,
        features: features,
        maxGuests: villa.max_guests || 2,
        bedrooms: Math.floor((villa.max_guests || 2) / 2), // Estimate bedrooms
        bathrooms: Math.ceil((villa.max_guests || 2) / 3), // Estimate bathrooms
        location: villa.location || '',
        status: villa.status
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedVillas
    });

  } catch (error) {
    console.error('Error fetching villas:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}