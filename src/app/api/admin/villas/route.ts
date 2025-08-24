import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface VillaFormData {
  slug: string;
  title: string;
  description: string;
  long_description?: string;
  price: number;
  location: string;
  size: string;
  max_guests: number;
  status?: string;
  amenities?: Array<{ icon: string; text: string }>;
  features?: string[];
  images?: Array<{ image_url: string; alt_text: string; is_primary: boolean; sort_order: number }>;
}

interface VillaRow extends RowDataPacket {
  id: number;
  slug: string;
  title: string;
  description: string;
  long_description?: string;
  price: number;
  location: string;
  size: string;
  max_guests: number;
  status: string;
  created_at: Date;
  amenities?: string;
  features?: string;
  images?: string;
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
    
    const connection = await getDbConnection();
    
    let query = `
      SELECT v.*, 
             GROUP_CONCAT(DISTINCT CONCAT(va.icon, '|||', va.text) SEPARATOR '^^^') as amenities,
             GROUP_CONCAT(DISTINCT vf.feature_text SEPARATOR '^^^') as features,
             GROUP_CONCAT(DISTINCT CONCAT(vi.image_url, '|||', vi.alt_text, '|||', vi.is_primary, '|||', vi.sort_order) SEPARATOR '^^^') as images
      FROM villa_types v
      LEFT JOIN villa_amenities va ON v.id = va.villa_id
      LEFT JOIN villa_features vf ON v.id = vf.villa_id
      LEFT JOIN villa_images vi ON v.id = vi.villa_id
    `;
    
    const params: string[] = [];
    if (status) {
      query += ' WHERE v.status = ?';
      params.push(status);
    }
    
    query += ' GROUP BY v.id ORDER BY v.created_at DESC';
    
    const [rows] = await connection.execute<VillaRow[]>(query, params);
    const villas = rows.map(row => ({
      ...row,
      amenities: row.amenities ? row.amenities.split('^^^').map((item: string) => {
        const [icon, text] = item.split('|||');
        return { icon, text };
      }) : [],
      features: row.features ? row.features.split('^^^') : [],
      images: row.images ? row.images.split('^^^').map((item: string) => {
        const [image_url, alt_text, is_primary, sort_order] = item.split('|||');
        return { image_url, alt_text, is_primary: is_primary === '1', sort_order: parseInt(sort_order) };
      }) : []
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

    const body: VillaFormData = await request.json();
    const {
      slug, title, description, long_description, price, location, size, max_guests, status,
      amenities, features, images
    } = body;

    const connection = await getDbConnection();

    try {
      // Insert villa
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO villa_types (slug, title, description, long_description, price, location, size, max_guests, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [slug, title, description, long_description || '', price, location, size, max_guests, status || 'active']
      );

      const villaId = result.insertId;

      // Insert amenities
      if (amenities && amenities.length > 0) {
        for (const amenity of amenities) {
          await connection.execute(
            'INSERT INTO villa_amenities (villa_id, icon, text) VALUES (?, ?, ?)',
            [villaId, amenity.icon, amenity.text]
          );
        }
      }

      // Insert features
      if (features && features.length > 0) {
        for (const feature of features) {
          await connection.execute(
            'INSERT INTO villa_features (villa_id, feature_text) VALUES (?, ?)',
            [villaId, feature]
          );
        }
      }

      // Insert images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          await connection.execute(
            'INSERT INTO villa_images (villa_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
            [villaId, image.image_url, image.alt_text, image.is_primary, i]
          );
        }
      }

      return NextResponse.json({ success: true, data: { id: villaId, ...body } });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating villa:', error);
    return NextResponse.json({ success: false, error: 'Failed to create villa' }, { status: 500 });
  }
}