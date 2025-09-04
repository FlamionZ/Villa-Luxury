import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

interface VillaDetail extends RowDataPacket {
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

interface VillaAmenity extends RowDataPacket {
  icon: string;
  text: string;
}

interface VillaFeature extends RowDataPacket {
  feature_text: string;
}

interface VillaImage extends RowDataPacket {
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
    const db = await getDbConnection();

    // Get villa basic info
    const [villaRows] = await db.execute<VillaDetail[]>(
      'SELECT * FROM villa_types WHERE slug = ? AND status = "active"',
      [slug]
    );

    if (villaRows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Villa tidak ditemukan'
      }, { status: 404 });
    }

    const villa = villaRows[0];

    // Get amenities
    const [amenityRows] = await db.execute<VillaAmenity[]>(
      'SELECT icon, text FROM villa_amenities WHERE villa_id = ?',
      [villa.id]
    );

    // Get features
    const [featureRows] = await db.execute<VillaFeature[]>(
      'SELECT feature_text FROM villa_features WHERE villa_id = ?',
      [villa.id]
    );

    // Get images
    const [imageRows] = await db.execute<VillaImage[]>(
      'SELECT image_url, alt_text, is_primary, sort_order FROM villa_images WHERE villa_id = ? ORDER BY sort_order ASC, is_primary DESC',
      [villa.id]
    );

    // Format amenities
    const amenities = amenityRows.map(amenity => ({
      icon: amenity.icon,
      text: amenity.text
    }));

    // Format features
    const features = featureRows.map(feature => feature.feature_text);

    // Format images
    const images = imageRows.length > 0 
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