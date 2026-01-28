import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

interface GalleryItem {
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
    const supabase = getSupabaseAdmin();

    // Get current status
    const { data: item, error: itemError } = await supabase
      .from('gallery')
      .select('id, is_active')
      .eq('id', galleryId)
      .maybeSingle<GalleryItem>();

    if (itemError) {
      throw new Error(itemError.message);
    }

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    const currentStatus = item.is_active;
    const newStatus = !currentStatus;

    // Update status
    const { error: updateError } = await supabase
      .from('gallery')
      .update({ is_active: newStatus, updated_at: new Date().toISOString() })
      .eq('id', galleryId);

    if (updateError) {
      throw new Error(updateError.message);
    }

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