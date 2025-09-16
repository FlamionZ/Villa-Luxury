import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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

interface VillaRow extends RowDataPacket {
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
    console.log('Villa creation request received');
    
    const admin = await verifyAdminToken(request);
    if (!admin) {
      console.log('Unauthorized villa creation attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    console.log('Admin verified, parsing request body');
    const body: VillaFormData = await request.json();
    console.log('Request body parsed:', { slug: body.slug, title: body.title });
    const {
      slug, title, description, long_description, weekday_price, weekend_price, high_season_price, price, location, max_guests, status,
      amenities, features, images
    } = body;

    console.log('Attempting database connection');
    const connection = await getDbConnection();
    console.log('Database connection established');

    try {
      // Validate required fields
      if (!slug || !title || !description) {
        throw new Error('Missing required fields: slug, title, or description');
      }
      
      console.log('Inserting villa into database with data:', {
        slug, title, weekday_price, weekend_price, high_season_price, location, max_guests
      });
      
      // Insert villa
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO villa_types (slug, title, description, long_description, weekday_price, weekend_price, high_season_price, location, max_guests, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [slug, title, description, long_description || '', weekday_price, weekend_price, high_season_price, location, max_guests, status || 'active']
      );
      
      console.log('Villa inserted successfully, ID:', result.insertId);

      const villaId = result.insertId;

      // Insert amenities
      if (amenities && amenities.length > 0) {
        console.log(`Inserting ${amenities.length} amenities`);
        for (const amenity of amenities) {
          await connection.execute(
            'INSERT INTO villa_amenities (villa_id, icon, text) VALUES (?, ?, ?)',
            [villaId, amenity.icon, amenity.text]
          );
        }
        console.log('Amenities inserted successfully');
      }

      // Insert features
      if (features && features.length > 0) {
        console.log(`Inserting ${features.length} features`);
        for (const feature of features) {
          await connection.execute(
            'INSERT INTO villa_features (villa_id, feature_text) VALUES (?, ?)',
            [villaId, feature]
          );
        }
        console.log('Features inserted successfully');
      }

      // Insert images
      if (images && images.length > 0) {
        console.log(`Inserting ${images.length} images`);
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          await connection.execute(
            'INSERT INTO villa_images (villa_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
            [villaId, image.image_url, image.alt_text, image.is_primary, i]
          );
        }
        console.log('Images inserted successfully');
      }

      console.log('Villa creation completed successfully');
      return NextResponse.json({ success: true, data: { id: villaId, ...body } });
    } catch (error) {
      console.error('Database operation error:', error);
      throw error;
    } finally {
      // Release connection back to pool
      if (connection && 'release' in connection) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (connection as any).release();
        console.log('Database connection released');
      }
    }
  } catch (error) {
    console.error('Error creating villa:', error);
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Full error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create villa',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}