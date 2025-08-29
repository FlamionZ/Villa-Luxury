const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addIsActiveToGallery() {
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

    console.log('✅ Connected to database successfully!');

    // Check if column already exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM gallery LIKE 'is_active'"
    );

    if (columns.length === 0) {
      console.log('📝 Adding is_active column to gallery table...');
      
      // Add is_active column
      await connection.execute(`
        ALTER TABLE gallery 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER display_order
      `);
      
      console.log('✅ Column is_active added successfully!');
    } else {
      console.log('ℹ️  Column is_active already exists');
    }

    // Show table structure
    const [tableStructure] = await connection.execute('DESCRIBE gallery');
    console.log('\n📋 Gallery table structure:');
    tableStructure.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

addIsActiveToGallery();