const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  try {
    // Check if .env.local exists
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env.local file not found!');
      console.log('Please create .env.local file with database configuration:');
      console.log(`
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=villa_paradise
`);
      process.exit(1);
    }

    // Load environment variables
    require('dotenv').config({ path: envPath });

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    };

    console.log(`Attempting to connect to MySQL server at ${dbConfig.host}:${dbConfig.port}`);
    console.log(`Using username: ${dbConfig.user}`);

    // Create connection to MySQL server (without database)
    const connection = await mysql.createConnection(dbConfig);

    console.log('✅ Connected to MySQL server successfully!');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'villa_paradise';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created or already exists`);

    // Close the initial connection
    await connection.end();

    // Create new connection to the database
    const dbConnection = await mysql.createConnection({
      ...dbConfig,
      database: dbName,
      multipleStatements: true
    });

    console.log(`✅ Connected to '${dbName}' database`);

    // Read and execute SQL schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found at:', schemaPath);
      process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Schema file loaded');

    // Split SQL statements and execute them
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`🔄 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await dbConnection.execute(statement);
          
          // Log progress for major operations
          if (statement.toLowerCase().includes('create table')) {
            const tableName = statement.match(/create table (\w+)/i)?.[1];
            console.log(`✅ Table '${tableName}' created`);
          } else if (statement.toLowerCase().includes('insert into')) {
            const tableName = statement.match(/insert into (\w+)/i)?.[1];
            if (tableName) {
              console.log(`📝 Data inserted into '${tableName}'`);
            }
          }
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.error('❌ Error executing statement:', statement.substring(0, 100) + '...');
            console.error('Error:', error.message);
          }
        }
      }
    }

    // Hash default admin password
    console.log('🔐 Setting up admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update admin password
    await dbConnection.execute(
      'UPDATE admin_users SET password_hash = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );

    console.log('✅ Database initialized successfully!');
    console.log('\n🎉 Setup Complete!');
    console.log('📊 Admin Dashboard: http://localhost:3000/admin');
    console.log('🔑 Default admin credentials:');
    console.log('   Username: Villadiengluxury');
    console.log('   Password: admin123');
    console.log('\n💡 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:3000/admin');
    console.log('   3. Login with admin/admin123');

    await dbConnection.end();
  } catch (error) {
    console.error('\n❌ Error initializing database:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔴 Cannot connect to MySQL server!');
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check if MySQL is installed:');
      console.log('   - Windows: Check services or XAMPP/WAMP');
      console.log('   - Mac: brew services start mysql');
      console.log('   - Linux: sudo systemctl start mysql');
      console.log('3. Verify database credentials in .env.local');
      console.log('4. Check if port 3306 is open');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔴 Access denied! Check username/password in .env.local');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🔴 Database does not exist (this should be auto-created)');
    } else {
      console.error('🔴 Unexpected error:', error.message);
    }
    
    console.log('\n📝 Current configuration:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    console.log(`   Port: ${process.env.DB_PORT || '3306'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'villa_paradise'}`);
    
    process.exit(1);
  }
}

initializeDatabase();