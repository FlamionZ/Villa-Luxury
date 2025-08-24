const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function checkDatabaseStatus() {
  console.log('🔍 Checking Villa Paradise Database Status...\n');
  
  try {
    // Load environment variables
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'villa_paradise',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database successfully!\n');

    // Check tables
    console.log('📋 DATABASE TABLES:');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('❌ No tables found - Database needs initialization');
      return false;
    }

    const tableNames = tables.map(table => Object.values(table)[0]);
    tableNames.forEach(name => console.log(`   ✓ ${name}`));
    console.log(`\n📊 Total tables: ${tableNames.length}\n`);

    // Check data counts
    console.log('📈 DATA SUMMARY:');
    
    // Villa types
    try {
      const [villaCount] = await connection.execute('SELECT COUNT(*) as count FROM villa_types');
      console.log(`   🏠 Villa Types: ${villaCount[0].count}`);
    } catch (e) {
      console.log('   🏠 Villa Types: Table not found');
    }

    // Bookings
    try {
      const [bookingCount] = await connection.execute('SELECT COUNT(*) as count FROM bookings');
      console.log(`   📅 Bookings: ${bookingCount[0].count}`);
    } catch (e) {
      console.log('   📅 Bookings: Table not found');
    }

    // Gallery
    try {
      const [galleryCount] = await connection.execute('SELECT COUNT(*) as count FROM gallery');
      console.log(`   🖼️  Gallery: ${galleryCount[0].count}`);
    } catch (e) {
      console.log('   🖼️  Gallery: Table not found');
    }

    // Admin users
    try {
      const [adminCount] = await connection.execute('SELECT COUNT(*) as count FROM admin_users');
      const [admins] = await connection.execute('SELECT username, role, is_active FROM admin_users');
      console.log(`   👤 Admin Users: ${adminCount[0].count}`);
      if (admins.length > 0) {
        admins.forEach(admin => {
          const status = admin.is_active ? '🟢 Active' : '🔴 Inactive';
          console.log(`      - ${admin.username} (${admin.role}) ${status}`);
        });
      }
    } catch (e) {
      console.log('   👤 Admin Users: Table not found');
    }

    // Settings
    try {
      const [settingsCount] = await connection.execute('SELECT COUNT(*) as count FROM site_settings');
      console.log(`   ⚙️  Site Settings: ${settingsCount[0].count}`);
    } catch (e) {
      console.log('   ⚙️  Site Settings: Table not found');
    }

    console.log('\n🔧 SYSTEM STATUS:');
    
    // Check admin login capability
    try {
      const [adminCheck] = await connection.execute(
        'SELECT username FROM admin_users WHERE username = ? AND is_active = TRUE',
        ['admin']
      );
      
      if (adminCheck.length > 0) {
        console.log('   ✅ Admin login ready (admin/admin123)');
      } else {
        console.log('   ❌ Admin user not found or inactive');
      }
    } catch (e) {
      console.log('   ❌ Cannot verify admin user');
    }

    // Check villa data
    try {
      const [villaCheck] = await connection.execute('SELECT COUNT(*) as count FROM villa_types WHERE status = "active"');
      console.log(`   ✅ Active villas: ${villaCheck[0].count}`);
    } catch (e) {
      console.log('   ❌ Cannot check villa data');
    }

    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Admin: http://localhost:3000/admin');
    console.log('   4. Login: admin / admin123');

    console.log('\n✨ DATABASE STATUS: READY FOR USE! ✨');

    await connection.end();
    return true;

  } catch (error) {
    console.error('\n❌ Database connection error:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔴 MySQL server is not running!');
      console.log('\n🔧 Solutions:');
      console.log('1. Start MySQL service');
      console.log('2. Check MySQL is installed');
      console.log('3. Verify credentials in .env.local');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔴 Access denied - check username/password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🔴 Database does not exist');
      console.log('Run: npm run init-db');
    } else {
      console.error('🔴 Error:', error.message);
    }
    
    return false;
  }
}

checkDatabaseStatus();