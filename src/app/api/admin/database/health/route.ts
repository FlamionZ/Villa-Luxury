import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/database';

/**
 * Simple database health endpoint for admin checks.
 * Returns connection status plus optional error info in non-production.
 */
export async function GET() {
	try {
		const conn = await getDbConnection();
		// Ping to verify connectivity
		await conn.ping();

		// Release connection if available
		if ('release' in conn) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(conn as any).release();
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
