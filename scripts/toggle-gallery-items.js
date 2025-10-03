const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function toggleGalleryItems() {
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

    console.log('🔄 Toggling some gallery items to inactive...');

    // Set items 3, 4, 5 to inactive for testing
    await connection.execute(
      'UPDATE gallery SET is_active = FALSE WHERE id IN (3, 4, 5)'
    );

    console.log('✅ Gallery items 3, 4, 5 set to inactive');

    // Check results
    const [rows] = await connection.execute('SELECT id, title, is_active FROM gallery ORDER BY id');
    
    console.log('\nCurrent gallery status:');
    rows.forEach(r => {
      console.log(`ID: ${r.id}, Title: ${r.title}, Active: ${r.is_active ? 'Yes' : 'No'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

toggleGalleryItems();