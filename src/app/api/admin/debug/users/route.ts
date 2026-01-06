import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDbConnection } from '@/lib/database';

export async function GET() {
  try {
    console.log('=== ADMIN USER DEBUG START ===');
    
    const connection = await getDbConnection();
    
    // Check if admin_users table exists
    console.log('Checking admin_users table...');
    const [tables] = await connection.execute('SHOW TABLES LIKE "admin_users"');
    console.log('Admin_users table exists:', Array.isArray(tables) && tables.length > 0);
    
    if (!Array.isArray(tables) || tables.length === 0) {
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
      console.log('Admin_users table created');
    }
    
    // Check existing admin users
    const [users] = await connection.execute('SELECT id, username, email, role, is_active FROM admin_users');
    console.log('Existing admin users:', users);
    
    // Create default admin if none exists
    if (Array.isArray(users) && users.length === 0) {
      console.log('Creating default admin user...');
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Mandadanyumna';
      const passwordHash = await bcrypt.hash(defaultPassword, 12);
      
      await connection.execute(
        'INSERT INTO admin_users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Villadiengluxury', 'villadiengluxury@gmail.com', passwordHash, 'admin']
      );
      console.log('Default admin user created');
      console.log('Username: Villadiengluxury');
      console.log('Password:', defaultPassword);
    }
    
    // Final check
    const [finalUsers] = await connection.execute('SELECT id, username, email, role, is_active FROM admin_users');
    console.log('Final admin users:', finalUsers);
    
    // Release connection
    if (connection && 'release' in connection) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (connection as any).release();
    }
    
    console.log('=== ADMIN USER DEBUG END ===');
    
    return NextResponse.json({
      success: true,
      message: 'Admin user debug completed',
      data: {
        tableExists: Array.isArray(tables) && tables.length > 0,
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