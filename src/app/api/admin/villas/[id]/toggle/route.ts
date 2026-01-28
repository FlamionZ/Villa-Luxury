import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

interface Villa {
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
    const supabase = getSupabaseAdmin();

    // Get current status
    const { data: villa, error: villaError } = await supabase
      .from('villa_types')
      .select('id, status')
      .eq('id', villaId)
      .maybeSingle<Villa>();

    if (villaError) {
      throw new Error(villaError.message);
    }

    if (!villa) {
      return NextResponse.json(
        { success: false, error: 'Villa not found' },
        { status: 404 }
      );
    }

    const currentStatus = villa.status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    // Update status
    const { error: updateError } = await supabase
      .from('villa_types')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', villaId);

    if (updateError) {
      throw new Error(updateError.message);
    }

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