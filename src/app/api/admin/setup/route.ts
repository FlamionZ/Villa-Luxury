import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDbConnection } from '@/lib/database';

export async function POST() {
  try {
    console.log('=== ADMIN SETUP START ===');
    
    const connection = await getDbConnection();
    
    // Create admin_users table
    console.log('Creating admin_users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Admin_users table created/verified');
    
    // Check if admin already exists
    const [existing] = await connection.execute(
      'SELECT id FROM admin_users WHERE username = ?',
      ['Villadiengluxury']
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      console.log('⚠️ Admin user already exists');
      
      // Update password anyway
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Mandadanyumna';
      const passwordHash = await bcrypt.hash(defaultPassword, 12);
      
      await connection.execute(
        'UPDATE admin_users SET password_hash = ?, is_active = TRUE WHERE username = ?',
        [passwordHash, 'Villadiengluxury']
      );
      console.log('✅ Admin password updated');
    } else {
      // Create new admin user
      console.log('Creating new admin user...');
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Mandadanyumna';
      const passwordHash = await bcrypt.hash(defaultPassword, 12);
      
      await connection.execute(
        'INSERT INTO admin_users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
        ['Villadiengluxury', 'villadiengluxury@gmail.com', passwordHash, 'admin', true]
      );
      console.log('✅ New admin user created');
    }
    
    // Verify admin user
    const [users] = await connection.execute(
      'SELECT id, username, email, role, is_active FROM admin_users WHERE username = ?',
      ['Villadiengluxury']
    );
    console.log('Final admin user:', users);
    
    // Release connection
    if (connection && 'release' in connection) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (connection as any).release();
    }
    
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