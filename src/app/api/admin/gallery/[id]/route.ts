import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

interface GalleryItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

    const supabase = getSupabaseAdmin();
    const { id } = await params;

    const { data: item, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('id', id)
      .maybeSingle<GalleryItem>();

    if (error) {
      throw new Error(error.message);
    }

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item
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

    const supabase = getSupabaseAdmin();
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
    const { data: existingItem, error: existingError } = await supabase
      .from('gallery')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    // Update the gallery item
    const { data: updatedItem, error: updateError } = await supabase
      .from('gallery')
      .update({
        title,
        description: description || '',
        image_url,
        alt_text: alt_text || '',
        display_order: display_order || 0,
        is_active: is_active !== false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single<GalleryItem>();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      success: true,
      data: updatedItem,
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

    const supabase = getSupabaseAdmin();
    const { id } = await params;

    // Check if gallery item exists
    const { data: existingItem, error: existingError } = await supabase
      .from('gallery')
      .select('id, title')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    // Delete the gallery item
    const { error: deleteError } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

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