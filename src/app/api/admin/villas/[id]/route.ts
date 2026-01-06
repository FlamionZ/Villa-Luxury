import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

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

interface BookingCheck extends RowDataPacket {
  count: number;
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
    const connection = await getDbConnection();
    
    const [rows] = await connection.execute<VillaRow[]>(
      `SELECT v.*, 
             GROUP_CONCAT(DISTINCT CONCAT(va.icon, '|||', va.text) SEPARATOR '^^^') as amenities,
             GROUP_CONCAT(DISTINCT vf.feature_text SEPARATOR '^^^') as features,
             GROUP_CONCAT(DISTINCT CONCAT(vi.image_url, '|||', vi.alt_text, '|||', vi.is_primary, '|||', vi.sort_order) SEPARATOR '^^^') as images
      FROM villa_types v
      LEFT JOIN villa_amenities va ON v.id = va.villa_id
      LEFT JOIN villa_features vf ON v.id = vf.villa_id
      LEFT JOIN villa_images vi ON v.id = vi.villa_id
      WHERE v.id = ?
      GROUP BY v.id`,
      [villaId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Villa not found' }, { status: 404 });
    }

    const villa = rows[0];
    const formattedVilla = {
      ...villa,
      amenities: villa.amenities ? villa.amenities.split('^^^').map((item: string) => {
        const [icon, text] = item.split('|||');
        return { icon, text };
      }) : [],
      features: villa.features ? villa.features.split('^^^') : [],
      images: villa.images ? villa.images.split('^^^').map((item: string) => {
        const [image_url, alt_text, is_primary, sort_order] = item.split('|||');
        return { image_url, alt_text, is_primary: is_primary === '1', sort_order: parseInt(sort_order) };
      }) : []
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

    const connection = await getDbConnection();

    try {
      // Update villa
      await connection.execute(
        `UPDATE villa_types 
         SET slug = ?, title = ?, description = ?, long_description = ?, weekday_price = ?, weekend_price = ?, high_season_price = ?, 
             location = ?, max_guests = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [slug, title, description, long_description || null, weekday_price, weekend_price, high_season_price, location, max_guests, status || 'active', villaId]
      );

      // Delete existing amenities, features, images
      await connection.execute('DELETE FROM villa_amenities WHERE villa_id = ?', [villaId]);
      await connection.execute('DELETE FROM villa_features WHERE villa_id = ?', [villaId]);
      await connection.execute('DELETE FROM villa_images WHERE villa_id = ?', [villaId]);

      // Insert new amenities
      if (amenities && amenities.length > 0) {
        for (const amenity of amenities) {
          await connection.execute(
            'INSERT INTO villa_amenities (villa_id, icon, text) VALUES (?, ?, ?)',
            [villaId, amenity.icon, amenity.text]
          );
        }
      }

      // Insert new features
      if (features && features.length > 0) {
        for (const feature of features) {
          await connection.execute(
            'INSERT INTO villa_features (villa_id, feature_text) VALUES (?, ?)',
            [villaId, feature]
          );
        }
      }

      // Insert new images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          await connection.execute(
            'INSERT INTO villa_images (villa_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
            [villaId, image.image_url, image.alt_text, image.is_primary, i]
          );
        }
      }

      return NextResponse.json({ success: true, message: 'Villa updated successfully' });
    } catch (error) {
      throw error;
    }
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
    const connection = await getDbConnection();

    // Check if there are any active bookings for this villa
    const [bookings] = await connection.execute<BookingCheck[]>(
      'SELECT COUNT(*) as count FROM bookings WHERE villa_id = ? AND status IN ("confirmed", "pending")',
      [villaId]
    );

    if (bookings[0].count > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete villa with active bookings' },
        { status: 400 }
      );
    }

    // Delete villa and all related data (cascade will handle amenities, features, images)
    await connection.execute('DELETE FROM villa_types WHERE id = ?', [villaId]);

    return NextResponse.json({ success: true, message: 'Villa deleted successfully' });
  } catch (error) {
    console.error('Error deleting villa:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete villa' }, { status: 500 });
  }
}