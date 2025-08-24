import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/database';
import { verifyAdminToken } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface GalleryItem extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// GET - Fetch all gallery items for admin
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const db = await getDbConnection();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Get total count
    const [countResult] = await db.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM gallery'
    );
    const total = countResult[0].total;
    
    // Get gallery items
    const [galleryItems] = await db.execute<GalleryItem[]>(
      'SELECT * FROM gallery ORDER BY display_order ASC, created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    return NextResponse.json({
      success: true,
      data: galleryItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch gallery items';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Create new gallery item
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const db = await getDbConnection();
    const body = await request.json();
    
    const { title, description, image_url, alt_text, display_order, is_active } = body;

    if (!title || !image_url) {
      return NextResponse.json(
        { success: false, error: 'Title and image URL are required' },
        { status: 400 }
      );
    }

    // Insert new gallery item
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO gallery (title, description, image_url, alt_text, display_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || '', image_url, alt_text || '', display_order || 0, is_active !== false]
    );

    const insertId = result.insertId;

    // Fetch the created item
    const [newItem] = await db.execute<GalleryItem[]>(
      'SELECT * FROM gallery WHERE id = ?',
      [insertId]
    );

    return NextResponse.json({
      success: true,
      data: newItem[0],
      message: 'Gallery item created successfully'
    });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create gallery item';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}