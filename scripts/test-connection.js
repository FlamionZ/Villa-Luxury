const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  let connection;
  
  try {
    console.log('🔗 Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    console.log('Port:', process.env.DB_PORT);
    
    // Test with individual parameters first
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

    console.log('✅ Connected successfully!');
    
    // Test a simple query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test passed:', result);
    
    // Show current database
    const [dbResult] = await connection.execute('SELECT DATABASE() as current_db');
    console.log('📊 Current database:', dbResult[0].current_db);
    
    // Show tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Verify your password is correct');
      console.log('2. Check if the user has proper permissions');
      console.log('3. Ensure the database exists');
      console.log('4. Verify the host and port are correct');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();