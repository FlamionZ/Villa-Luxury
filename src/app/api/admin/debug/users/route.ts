import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('=== ADMIN USER DEBUG START ===');
    
    const supabase = getSupabaseAdmin();
    
    // Check existing admin users
    const { data: users, error: usersError } = await supabase
      .from('admin_users')
      .select('id, username, email, role, is_active');

    if (usersError) {
      throw new Error(usersError.message);
    }

    console.log('Existing admin users:', users);
    
    // Create default admin if none exists
    if (Array.isArray(users) && users.length === 0) {
      console.log('Creating default admin user...');
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
      console.log('Default admin user created');
      console.log('Username: Villadiengluxury');
      console.log('Password:', defaultPassword);
    }
    
    // Final check
    const { data: finalUsers, error: finalError } = await supabase
      .from('admin_users')
      .select('id, username, email, role, is_active');

    if (finalError) {
      throw new Error(finalError.message);
    }

    console.log('Final admin users:', finalUsers);
    
    console.log('=== ADMIN USER DEBUG END ===');
    
    return NextResponse.json({
      success: true,
      message: 'Admin user debug completed',
      data: {
        tableExists: true,
        userCount: Array.isArray(finalUsers) ? finalUsers.length : 0,
        users: finalUsers
      }
    });
    
  } catch (error) {
    console.error('Admin user debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Admin user debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}