const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function toggleVillaStatus() {
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

    console.log('🔄 Toggling villa status...');

    // Activate Modern Pool Villa (ID: 2)
    await connection.execute(
      'UPDATE villa_types SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['active', 2]
    );

    console.log('✅ Modern Pool Villa activated');

    // Check results
    const [rows] = await connection.execute('SELECT id, title, status FROM villa_types ORDER BY id');
    
    console.log('\nCurrent villa status:');
    rows.forEach(r => {
      console.log(`ID: ${r.id}, Title: ${r.title}, Status: ${r.status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

toggleVillaStatus();