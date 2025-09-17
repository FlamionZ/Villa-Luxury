import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getDbConnection } from '@/lib/database';

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
      DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
      DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET', 
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
      DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
      DB_PORT: process.env.DB_PORT ? 'SET' : 'NOT SET',
    });

    // Test database connection
    console.log('Testing database connection...');
    const connection = await getDbConnection();
    console.log('Database connection successful');

    // Test a simple query
    console.log('Testing simple query...');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Simple query successful:', rows);

    // Test villa_types table exists
    console.log('Testing villa_types table...');
    const [tableCheck] = await connection.execute('SHOW TABLES LIKE "villa_types"');
    console.log('Villa_types table check:', tableCheck);

    // Test villa_types table structure
    console.log('Testing villa_types table structure...');
    const [columns] = await connection.execute('DESCRIBE villa_types');
    console.log('Villa_types columns:', columns);

    // Release connection
    if (connection && 'release' in connection) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (connection as any).release();
      console.log('Database connection released');
    }

    console.log('=== Database Connection Test Completed Successfully ===');

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection test successful',
      data: {
        environment: process.env.NODE_ENV,
        connectionTest: 'PASSED',
        simpleQuery: 'PASSED',
        tableExists: Array.isArray(tableCheck) && tableCheck.length > 0 ? 'PASSED' : 'FAILED',
        columnsCount: Array.isArray(columns) ? columns.length : 0
      }
    });

  } catch (error) {
    console.error('=== Database Connection Test FAILED ===');
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      code: (error as any)?.code,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errno: (error as any)?.errno,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sqlState: (error as any)?.sqlState,
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    return NextResponse.json({ 
      success: false, 
      error: 'Database connection test failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code: (error as any)?.code,
        environment: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}