require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkGallery() {
  try {
    console.log('🔍 Checking gallery data...');
    
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

    const [galleries] = await connection.execute(
      'SELECT id, title, image_url, is_active FROM gallery ORDER BY id'
    );

    console.log('📋 Gallery items:');
    galleries.forEach(item => {
      console.log(`ID: ${item.id}, Title: ${item.title}, Active: ${item.is_active}`);
      console.log(`URL: ${item.image_url}`);
      console.log('---');
    });

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkGallery();