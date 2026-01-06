// API untuk test villa creation secara step by step
import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    console.log('🔍 Testing villa creation step by step...');
    
    const connection = await getDbConnection();
    
    // Check villa_types table structure
    console.log('📊 Checking villa_types table structure...');
    const [structure] = await connection.execute<RowDataPacket[]>('DESCRIBE villa_types');
    console.log('Villa_types structure:', structure);
    
    // Check if we can insert a simple test record
    console.log('🧪 Testing simple insert...');
    const testSlug = `test-${Date.now()}`;
    
    try {
      const [result] = await connection.execute<ResultSetHeader>(`
        INSERT INTO villa_types (slug, title, description, price, weekday_price, weekend_price, high_season_price, location, max_guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [testSlug, 'Test Villa', 'Test Description', 1000000, 1000000, 1200000, 1500000, 'Test Location', 4, 'active']);
      
      console.log('✅ Test insert successful, ID:', result.insertId);
      
      // Clean up test record
      await connection.execute('DELETE FROM villa_types WHERE slug = ?', [testSlug]);
      console.log('🧹 Test record cleaned up');
      
      return NextResponse.json({
        success: true,
        message: 'Villa creation test passed',
        tableStructure: structure,
        testResult: 'Insert test successful'
      });
      
    } catch (insertError) {
      console.error('❌ Insert test failed:', insertError);
      
      // Get detailed error information
      const err = insertError as { code?: unknown; errno?: unknown; sqlState?: unknown; sqlMessage?: unknown; sql?: unknown };
      const errorDetails = {
        message: insertError instanceof Error ? insertError.message : 'Unknown error',
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage,
        sql: err.sql,
        stack: insertError instanceof Error ? insertError.stack : 'No stack trace'
      };
      
      return NextResponse.json({
        success: false,
        message: 'Villa creation test failed',
        tableStructure: structure,
        errorDetails: errorDetails,
        testQuery: `INSERT INTO villa_types (slug, title, description, weekday_price, weekend_price, high_season_price, location, max_guests, status) VALUES ('${testSlug}', 'Test Villa', 'Test Description', 1000000, 1200000, 1500000, 'Test Location', 4, 'active')`
      });
    }
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}