import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

interface GalleryItem extends RowDataPacket {
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
    const db = await getDbConnection();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const [galleryItems] = await db.execute<GalleryItem[]>(
      'SELECT id, title, description, image_url, alt_text, display_order FROM gallery WHERE is_active = TRUE ORDER BY display_order ASC, created_at DESC LIMIT ?',
      [limit]
    );
    
    return NextResponse.json({
      success: true,
      data: galleryItems
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