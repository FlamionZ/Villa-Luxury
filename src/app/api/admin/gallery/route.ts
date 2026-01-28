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

    const supabase = getSupabaseAdmin();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    const { data: galleryItems, error, count } = await supabase
      .from('gallery')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(error.message);
    }

    const total = count ?? 0;
    
    return NextResponse.json({
      success: true,
      data: galleryItems ?? [],
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

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    
    const { title, description, image_url, alt_text, display_order, is_active } = body;

    if (!title || !image_url) {
      return NextResponse.json(
        { success: false, error: 'Title and image URL are required' },
        { status: 400 }
      );
    }

    // Insert new gallery item
    const { data: newItem, error: insertError } = await supabase
      .from('gallery')
      .insert({
        title,
        description: description || '',
        image_url,
        alt_text: alt_text || '',
        display_order: display_order || 0,
        is_active: is_active !== false
      })
      .select('*')
      .single<GalleryItem>();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json({
      success: true,
      data: newItem,
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