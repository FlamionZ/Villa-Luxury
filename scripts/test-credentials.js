const mysql = require('mysql2/promise');

async function testWithCredentials() {
  console.log('🔐 Database Credential Tester');
  console.log('============================');
  
  // Test credentials (JANGAN commit file ini dengan password asli!)
  const testCredentials = {
    host: 'serverless-us-central1.sysp0000.db2.skysql.com',
    user: 'dbpgf28171728',
    password: '7UGXOPGo*iXY3iqN6?Asi', // ← GANTI INI
    database: 'dbpgf28171728',
    port: 4005,
    ssl: {
      rejectUnauthorized: false
    }
  };

  console.log('Testing with:');
  console.log('Host:', testCredentials.host);
  console.log('User:', testCredentials.user);
  console.log('Password:', testCredentials.password.replace(/./g, '*'));
  console.log('Database:', testCredentials.database);
  console.log('Port:', testCredentials.port);
  console.log('');

  if (testCredentials.password === 'MASUKKAN_PASSWORD_DISINI') {
    console.log('❌ ERROR: Please update the password in this file first!');
    console.log('Edit scripts/test-credentials.js and replace MASUKKAN_PASSWORD_DISINI');
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(testCredentials);
    console.log('✅ Connection successful!');
    
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test passed');
    
    await connection.end();
    
    console.log('');
    console.log('🎉 Database credentials are working!');
    console.log('Now update your .env.local file with the correct password.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('');
    console.log('🔧 Please check:');
    console.log('1. Password is correct');
    console.log('2. User has database access');
    console.log('3. IP is whitelisted (if required)');
    console.log('4. Database server is running');
  }
}

testWithCredentials();