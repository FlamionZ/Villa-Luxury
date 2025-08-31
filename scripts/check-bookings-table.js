require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkBookingsTable() {
  try {
    console.log('🔍 Checking bookings table structure...');
    
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

    // Check table structure
    const [columns] = await connection.execute('DESCRIBE bookings');
    console.log('📋 Bookings table columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Check existing data
    const [rows] = await connection.execute('SELECT * FROM bookings LIMIT 1');
    console.log('\n📊 Sample data:');
    if (rows.length > 0) {
      console.log(rows[0]);
    } else {
      console.log('No data found');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBookingsTable();