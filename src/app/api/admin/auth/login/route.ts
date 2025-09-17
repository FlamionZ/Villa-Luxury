import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

interface AdminUser extends RowDataPacket {
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

    console.log('🔗 Connecting to database...');
    const connection = await getDbConnection();
    console.log('✅ Database connected');
    
    // Check if admin_users table exists
    console.log('🔍 Checking admin_users table...');
    const [tables] = await connection.execute('SHOW TABLES LIKE "admin_users"');
    console.log('Admin_users table exists:', Array.isArray(tables) && tables.length > 0);
    
    if (!Array.isArray(tables) || tables.length === 0) {
      console.log('❌ Admin_users table does not exist');
      return NextResponse.json({
        success: false,
        message: 'Admin system not initialized. Please contact administrator.'
      }, { status: 500 });
    }
    
    // Find admin user
    console.log('🔍 Searching for admin user...');
    const [rows] = await connection.execute<AdminUser[]>(
      'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
      [username]
    );
    console.log('Query result count:', rows.length);

    const admin = rows[0];

    if (!admin) {
      console.log('❌ Admin user not found or inactive');
      
      // Check if user exists but is inactive
      const [inactiveRows] = await connection.execute<AdminUser[]>(
        'SELECT * FROM admin_users WHERE username = ?',
        [username]
      );
      
      if (inactiveRows.length > 0) {
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
    await connection.execute(
      'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
      [admin.id]
    );
    console.log('✅ Last login updated');

    // Release connection
    if (connection && 'release' in connection) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (connection as any).release();
      console.log('🔄 Database connection released');
    }

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