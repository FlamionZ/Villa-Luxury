import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET - Test database connection and environment variables
export async function GET(request: NextRequest) {
  try {
    console.log('=== Database Connection Test Started ===');
    
    // Check admin authorization
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Log environment variables (without sensitive data)
    console.log('Environment Variables Check:', {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
    });

    // Test database connection
    console.log('Testing Supabase connection...');
    const supabase = getSupabaseAdmin();

    console.log('Testing simple query...');
    const { data: rows, error: queryError } = await supabase
      .from('villa_types')
      .select('id')
      .limit(1);

    if (queryError) {
      throw new Error(queryError.message);
    }

    console.log('Simple query successful:', rows);

    console.log('=== Database Connection Test Completed Successfully ===');

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection test successful',
      data: {
        environment: process.env.NODE_ENV,
        connectionTest: 'PASSED',
        simpleQuery: 'PASSED',
        tableExists: Array.isArray(rows) ? 'PASSED' : 'FAILED'
      }
    });

  } catch (error) {
    console.error('=== Database Connection Test FAILED ===');
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    return NextResponse.json({ 
      success: false, 
      error: 'Database connection test failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}