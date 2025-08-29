import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

interface GalleryItem extends RowDataPacket {
  id: number;
  is_active: boolean;
}

export async function PATCH(
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

    const { id: galleryId } = await params;
    const connection = await getDbConnection();

    // Get current status
    const [rows] = await connection.execute<GalleryItem[]>(
      'SELECT id, is_active FROM gallery WHERE id = ?',
      [galleryId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    const currentStatus = rows[0].is_active;
    const newStatus = !currentStatus;

    // Update status
    await connection.execute(
      'UPDATE gallery SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, galleryId]
    );

    return NextResponse.json({
      success: true,
      message: `Gallery item status changed to ${newStatus ? 'active' : 'inactive'}`,
      data: { id: galleryId, is_active: newStatus }
    });

  } catch (error) {
    console.error('Error toggling gallery status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update gallery status' },
      { status: 500 }
    );
  }
}