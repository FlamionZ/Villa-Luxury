const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createDatabase() {
  let connection;
  
  try {
    console.log('🔗 Connecting to server without database...');
    
    // Connect tanpa specify database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '3306'),
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Connected to server successfully!');
    
    // Show available databases
    console.log('📋 Available databases:');
    const [databases] = await connection.execute('SHOW DATABASES');
    databases.forEach(db => {
      console.log('  -', Object.values(db)[0]);
    });
    
    // Check if our database exists
    const dbName = process.env.DB_NAME;
    const dbExists = databases.some(db => Object.values(db)[0] === dbName);
    
    if (dbExists) {
      console.log(`✅ Database '${dbName}' already exists!`);
    } else {
      console.log(`📥 Creating database '${dbName}'...`);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      console.log(`✅ Database '${dbName}' created successfully!`);
    }
    
    // Test connection to the specific database
    await connection.end();
    
    console.log('🔗 Testing connection to specific database...');
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
    
    // Test query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test passed');
    
    // Show current database
    const [dbResult] = await connection.execute('SELECT DATABASE() as current_db');
    console.log('📊 Current database:', dbResult[0].current_db);

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Access denied - check credentials');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n🔧 Database does not exist - will try to create it');
    } else {
      console.log('\n🔧 Error code:', error.code);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createDatabase();