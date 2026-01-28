import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

interface GalleryItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  alt_text: string;
  display_order: number;
}

// GET - Fetch active gallery items for public display
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const { data: galleryItems, error } = await supabase
      .from('gallery')
      .select('id, title, description, image_url, alt_text, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }
    
    return NextResponse.json({
      success: true,
      data: galleryItems ?? []
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