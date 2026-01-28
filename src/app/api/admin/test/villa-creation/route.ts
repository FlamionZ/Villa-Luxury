// API untuk test villa creation secara step by step
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Testing villa creation step by step...');
    
    const supabase = getSupabaseAdmin();
    
    // Check if we can insert a simple test record
    console.log('🧪 Testing simple insert...');
    const testSlug = `test-${Date.now()}`;
    
    try {
      const { data: createdVilla, error: insertError } = await supabase
        .from('villa_types')
        .insert({
          slug: testSlug,
          title: 'Test Villa',
          description: 'Test Description',
          price: 1000000,
          weekday_price: 1000000,
          weekend_price: 1200000,
          high_season_price: 1500000,
          location: 'Test Location',
          max_guests: 4,
          status: 'active'
        })
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }
      
      console.log('✅ Test insert successful, ID:', createdVilla?.id);
      
      // Clean up test record
      await supabase.from('villa_types').delete().eq('slug', testSlug);
      console.log('🧹 Test record cleaned up');
      
      return NextResponse.json({
        success: true,
        message: 'Villa creation test passed',
        tableStructure: 'Supabase table structure available in dashboard',
        testResult: 'Insert test successful'
      });
      
    } catch (insertError) {
      console.error('❌ Insert test failed:', insertError);
      
      const errorDetails = {
        message: insertError instanceof Error ? insertError.message : 'Unknown error',
        stack: insertError instanceof Error ? insertError.stack : 'No stack trace'
      };
      
      return NextResponse.json({
        success: false,
        message: 'Villa creation test failed',
        tableStructure: 'Supabase table structure available in dashboard',
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