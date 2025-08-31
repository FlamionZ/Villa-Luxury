require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkBookings() {
  try {
    console.log('🔍 Checking bookings data...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Check bookings table structure
    console.log('📋 Bookings table structure:');
    const [columns] = await connection.execute('DESCRIBE bookings');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
    });

    console.log('\n📊 Bookings data:');
    const [bookings] = await connection.execute(
      'SELECT id, guest_name, check_in_date, check_out_date, status, created_at FROM bookings ORDER BY id LIMIT 5'
    );

    if (bookings.length === 0) {
      console.log('No bookings found in database');
    } else {
      bookings.forEach(booking => {
        console.log(`ID: ${booking.id}, Guest: ${booking.guest_name}`);
        console.log(`Check-in: ${booking.check_in_date}`);
        console.log(`Check-out: ${booking.check_out_date}`);
        console.log(`Status: ${booking.status}`);
        console.log(`Created: ${booking.created_at}`);
        console.log('---');
      });
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBookings();