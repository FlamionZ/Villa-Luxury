import { NextRequest, NextResponse } from 'next/server';

// GET - Check villa availability
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // For now, return a simple availability response
    // This can be extended later with actual availability checking logic
    return NextResponse.json({
      success: true,
      data: {
        villa: slug,
        available: true,
        message: 'Villa is available for booking'
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
