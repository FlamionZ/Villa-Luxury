import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/database';
import { verifyAdminToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

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

// GET - Fetch single gallery item
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

    const db = await getDbConnection();
    const { id } = await params;

    const [rows] = await db.execute<GalleryItem[]>(
      'SELECT * FROM gallery WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery item' },
      { status: 500 }
    );
  }
}

// PUT - Update gallery item
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

    const db = await getDbConnection();
    const { id } = await params;
    const body = await request.json();
    
    const { title, description, image_url, alt_text, display_order, is_active } = body;

    if (!title || !image_url) {
      return NextResponse.json(
        { success: false, error: 'Title and image URL are required' },
        { status: 400 }
      );
    }

    // Check if gallery item exists
    const [existingRows] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM gallery WHERE id = ?',
      [id]
    );

    if (existingRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    // Update the gallery item
    await db.execute(
      `UPDATE gallery SET 
        title = ?, 
        description = ?, 
        image_url = ?, 
        alt_text = ?, 
        display_order = ?, 
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      [title, description || '', image_url, alt_text || '', display_order || 0, is_active !== false, id]
    );

    // Fetch updated item
    const [updatedRows] = await db.execute<GalleryItem[]>(
      'SELECT * FROM gallery WHERE id = ?',
      [id]
    );

    return NextResponse.json({
      success: true,
      data: updatedRows[0],
      message: 'Gallery item updated successfully'
    });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update gallery item';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete gallery item
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

    const db = await getDbConnection();
    const { id } = await params;

    // Check if gallery item exists
    const [existingRows] = await db.execute<RowDataPacket[]>(
      'SELECT id, title FROM gallery WHERE id = ?',
      [id]
    );

    if (existingRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    // Delete the gallery item
    await db.execute('DELETE FROM gallery WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete gallery item';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}