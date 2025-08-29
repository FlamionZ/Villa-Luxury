const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkGalleryStatus() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('Gallery status in database:');
    const [rows] = await connection.execute('SELECT id, title, is_active FROM gallery ORDER BY id');
    
    rows.forEach(r => {
      console.log(`ID: ${r.id}, Title: ${r.title}, Active: ${r.is_active}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkGalleryStatus();