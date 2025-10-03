import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

interface Villa extends RowDataPacket {
  id: number;
  status: string;
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

    const { id: villaId } = await params;
    const connection = await getDbConnection();

    // Get current status
    const [rows] = await connection.execute<Villa[]>(
      'SELECT id, status FROM villa_types WHERE id = ?',
      [villaId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Villa not found' },
        { status: 404 }
      );
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    // Update status
    await connection.execute(
      'UPDATE villa_types SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, villaId]
    );

    return NextResponse.json({
      success: true,
      message: `Villa status changed to ${newStatus}`,
      data: { id: villaId, status: newStatus }
    });

  } catch (error) {
    console.error('Error toggling villa status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update villa status' },
      { status: 500 }
    );
  }
}