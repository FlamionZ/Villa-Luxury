import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabaseAdmin } from '@/lib/supabase';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== ADMIN LOGIN DEBUG START ===');
    
    const { username, password } = await request.json();
    console.log('Login attempt for username:', username);

    if (!username || !password) {
      console.log('❌ Missing username or password');
      return NextResponse.json({
        success: false,
        message: 'Username and password are required'
      }, { status: 400 });
    }

    console.log('🔗 Connecting to Supabase...');
    const supabase = getSupabaseAdmin();
    console.log('✅ Supabase client ready');
    
    // Find admin user
    console.log('🔍 Searching for admin user...');
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .maybeSingle<AdminUser>();

    if (adminError) {
      console.error('Supabase admin query error:', adminError.message);
      return NextResponse.json({
        success: false,
        message: 'Admin system not initialized. Please contact administrator.'
      }, { status: 500 });
    }

    console.log('Query result count:', admin ? 1 : 0);

    if (!admin) {
      console.log('❌ Admin user not found or inactive');
      
      // Check if user exists but is inactive
      const { data: inactiveUser, error: inactiveError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .maybeSingle<AdminUser>();

      if (inactiveError) {
        console.error('Supabase inactive user query error:', inactiveError.message);
      }

      if (inactiveUser) {
        console.log('User exists but is inactive');
        return NextResponse.json({
          success: false,
          message: 'Account is inactive. Please contact administrator.'
        }, { status: 401 });
      }
      
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 });
    }

    console.log('✅ Admin user found:', { id: admin.id, username: admin.username, role: admin.role });

    // Verify password
    console.log('🔐 Verifying password...');
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 });
    }

    console.log('✅ Password verified successfully');

    // Update last login
    console.log('📝 Updating last login...');
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    if (updateError) {
      console.error('Failed to update last_login:', updateError.message);
    }
    console.log('✅ Last login updated');

    // Generate JWT token
    console.log('🎫 Generating JWT token...');
    const secret = process.env.NEXTAUTH_SECRET || 'default-secret';
    console.log('JWT secret available:', !!secret);
    
    const token = jwt.sign(
      { 
        id: admin.id,
        username: admin.username,
        role: admin.role 
      },
      secret,
      { expiresIn: '24h' }
    );
    console.log('✅ JWT token generated');

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });

    // Set secure httpOnly cookie
    console.log('🍪 Setting admin token cookie...');
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });
    console.log('✅ Cookie set successfully');

    console.log('🎉 LOGIN SUCCESSFUL');
    console.log('=== ADMIN LOGIN DEBUG END ===');
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}