const mysql = require('mysql2/promise');
const fs = require('fs');

async function runSql() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'villa_paradise'
    });
    
    console.log('Connected to database villa_paradise');
    
    // Check if gallery table exists
    const [existingTables] = await connection.execute(
      "SHOW TABLES LIKE 'gallery'"
    );
    
    if (existingTables.length > 0) {
      console.log('Gallery table already exists, dropping it first...');
      await connection.execute('DROP TABLE gallery');
    }
    
    const sql = fs.readFileSync('scripts/create-gallery-table.sql', 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    // Verify table creation
    const [tables] = await connection.execute("SHOW TABLES LIKE 'gallery'");
    if (tables.length > 0) {
      console.log('✓ Gallery table created successfully!');
      
      // Check data
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM gallery');
      console.log(`✓ Inserted ${rows[0].count} gallery items`);
    } else {
      console.log('✗ Gallery table was not created');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

runSql();