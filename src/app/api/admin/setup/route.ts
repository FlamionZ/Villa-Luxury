import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('=== ADMIN SETUP START ===');
    
    const supabase = getSupabaseAdmin();
    
    // Check if admin already exists
    const { data: existing, error: existingError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username', 'Villadiengluxury')
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }
    
    if (existing) {
      console.log('⚠️ Admin user already exists');
      
      // Update password anyway
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Mandadanyumna';
      const passwordHash = await bcrypt.hash(defaultPassword, 12);

      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ password_hash: passwordHash, is_active: true })
        .eq('username', 'Villadiengluxury');

      if (updateError) {
        throw new Error(updateError.message);
      }
      console.log('✅ Admin password updated');
    } else {
      // Create new admin user
      console.log('Creating new admin user...');
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Mandadanyumna';
      const passwordHash = await bcrypt.hash(defaultPassword, 12);

      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          username: 'Villadiengluxury',
          email: 'villadiengluxury@gmail.com',
          password_hash: passwordHash,
          role: 'admin',
          is_active: true
        });

      if (insertError) {
        throw new Error(insertError.message);
      }
      console.log('✅ New admin user created');
    }
    
    // Verify admin user
    const { data: users, error: usersError } = await supabase
      .from('admin_users')
      .select('id, username, email, role, is_active')
      .eq('username', 'Villadiengluxury');

    if (usersError) {
      throw new Error(usersError.message);
    }
    console.log('Final admin user:', users);
    
    console.log('=== ADMIN SETUP COMPLETE ===');
    
    return NextResponse.json({
      success: true,
      message: 'Admin user setup completed',
      data: {
        username: 'Villadiengluxury',
        email: 'villadiengluxury@gmail.com',
        defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'Mandadanyumna'
      }
    });
    
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Admin setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}