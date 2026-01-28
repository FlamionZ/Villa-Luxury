import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Simple database health endpoint for admin checks.
 * Returns connection status plus optional error info in non-production.
 */
export async function GET() {
	try {
		const supabase = getSupabaseAdmin();
		const { error } = await supabase
			.from('site_settings')
			.select('id')
			.limit(1);

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ success: true, status: 'ok' });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({
			success: false,
			status: 'error',
			message,
			debug: process.env.NODE_ENV !== 'production' ? { error: String(error) } : undefined
		}, { status: 500 });
	}
}
