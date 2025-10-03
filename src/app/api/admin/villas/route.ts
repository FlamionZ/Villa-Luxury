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
    console.log('=== VILLA CREATION DEBUG START ===');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    console.log('Environment:', process.env.NODE_ENV);
    
    const admin = await verifyAdminToken(request);
    if (!admin) {
      console.log('❌ UNAUTHORIZED: Admin verification failed');
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    console.log('✅ ADMIN VERIFIED');

    console.log('📥 PARSING REQUEST BODY...');
    let body: VillaFormData;
    try {
      body = await request.json();
      console.log('✅ REQUEST BODY PARSED');
      console.log('Body keys:', Object.keys(body));
      console.log('Required fields check:', {
        slug: !!body.slug,
        title: !!body.title,
        description: !!body.description,
        weekday_price: !!body.weekday_price,
        weekend_price: !!body.weekend_price,
        high_season_price: !!body.high_season_price,
        location: !!body.location,
        max_guests: !!body.max_guests
      });
    } catch (parseError) {
      console.error('❌ JSON PARSE ERROR:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 400 });
    }
    const {
      slug, title, description, long_description, weekday_price, weekend_price, high_season_price, price, location, max_guests, status,
      amenities, features, images
    } = body;

    console.log('🔍 EXTRACTED VILLA DATA:', {
      slug, title, description: description?.substring(0, 50) + '...',
      weekday_price, weekend_price, high_season_price, location, max_guests, status
    });

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
      console.error('❌ VALIDATION FAILED - Missing fields:', missingFields);
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }
    console.log('✅ VALIDATION PASSED');

    console.log('🔗 ATTEMPTING DATABASE CONNECTION...');
    console.log('DB Config Check:', {
      DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
      DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
      DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
      DB_PORT: process.env.DB_PORT ? 'SET' : 'NOT SET'
    });

    let connection;
    try {
      connection = await getDbConnection();
      console.log('✅ DATABASE CONNECTION ESTABLISHED');
      
      // Test connection with a simple query
      console.log('🧪 TESTING CONNECTION...');
      await connection.execute('SELECT 1');
      console.log('✅ CONNECTION TEST PASSED');
      
      console.log('📝 INSERTING VILLA INTO DATABASE...');
      
      // Insert villa with price field included
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO villa_types (slug, title, description, long_description, price, weekday_price, weekend_price, high_season_price, location, max_guests, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [slug, title, description, long_description || '', weekday_price, weekday_price, weekend_price, high_season_price, location, max_guests, status || 'active']
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
      console.log('✅ IMAGES INSERTED');
      } else {
        console.log('⏭️ NO IMAGES TO INSERT');
      }

      console.log('🎉 VILLA CREATION COMPLETED SUCCESSFULLY');
      console.log('=== VILLA CREATION DEBUG END ===');
      
      return NextResponse.json({ success: true, data: { id: villaId, ...body } });
    } catch (dbError) {
      console.error('❌ DATABASE OPERATION ERROR:');
      console.error('Error type:', typeof dbError);
      console.error('Error name:', dbError instanceof Error ? dbError.name : 'Unknown');
      console.error('Error message:', dbError instanceof Error ? dbError.message : 'Unknown error');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error('Error code:', (dbError as any)?.code);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error('Error errno:', (dbError as any)?.errno);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error('Error sqlState:', (dbError as any)?.sqlState);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error('Error sqlMessage:', (dbError as any)?.sqlMessage);
      console.error('Full error object:', dbError);
      throw dbError;
    } finally {
      // Release connection back to pool
      if (connection && 'release' in connection) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (connection as any).release();
          console.log('🔄 DATABASE CONNECTION RELEASED');
        } catch (releaseError) {
          console.error('⚠️ ERROR RELEASING CONNECTION:', releaseError);
        }
      }
    }
  } catch (error) {
    console.error('=== VILLA CREATION FAILED ===');
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    
    // Detailed error analysis
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Database-specific error analysis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbError = error as any;
    if (dbError?.code) {
      console.error('Database error code:', dbError.code);
      console.error('Database error errno:', dbError.errno);
      console.error('Database error sqlState:', dbError.sqlState);
      console.error('Database error sqlMessage:', dbError.sqlMessage);
      console.error('Database error fatal:', dbError.fatal);
    }
    
    // Network/Connection error analysis
    if (dbError?.address || dbError?.port) {
      console.error('Network error - address:', dbError.address);
      console.error('Network error - port:', dbError.port);
      console.error('Network error - code:', dbError.code);
    }
    
    // Environment debugging
    console.error('Environment debug:', {
      NODE_ENV: process.env.NODE_ENV,
      hasDbHost: !!process.env.DB_HOST,
      hasDbUser: !!process.env.DB_USER,
      hasDbPassword: !!process.env.DB_PASSWORD,
      hasDbName: !!process.env.DB_NAME,
      hasDbPort: !!process.env.DB_PORT
    });
    
    // Generate user-friendly error message
    let userErrorMessage = 'Failed to create villa';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        userErrorMessage = 'Database connection failed. Please try again later.';
        errorCode = 'DB_CONNECTION_ERROR';
      } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        userErrorMessage = 'Database connection timeout. Please try again.';
        errorCode = 'DB_TIMEOUT_ERROR';
      } else if (error.message.includes('Access denied') || error.message.includes('authentication')) {
        userErrorMessage = 'Database authentication failed.';
        errorCode = 'DB_AUTH_ERROR';
      } else if (error.message.includes('ER_NO_SUCH_TABLE')) {
        userErrorMessage = 'Database schema error. Please contact administrator.';
        errorCode = 'DB_SCHEMA_ERROR';
      } else if (error.message.includes('ER_DUP_ENTRY')) {
        userErrorMessage = 'Villa with this slug already exists. Please use a different slug.';
        errorCode = 'DUPLICATE_SLUG_ERROR';
      } else if (error.message.includes('Missing required fields')) {
        userErrorMessage = error.message;
        errorCode = 'VALIDATION_ERROR';
      }
    }
    
    console.error('Final error response:', {
      success: false,
      error: userErrorMessage,
      errorCode,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: false, 
      error: userErrorMessage,
      errorCode,
      timestamp: new Date().toISOString(),
      // Include debug info only in development
      debug: process.env.NODE_ENV === 'development' ? {
        originalError: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code: (error as any)?.code
      } : undefined
    }, { status: 500 });
  }
}