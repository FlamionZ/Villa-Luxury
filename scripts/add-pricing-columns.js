const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addPricingColumns() {
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

    // Check if columns already exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'villa_types' 
      AND COLUMN_NAME IN ('weekday_price', 'weekend_price', 'high_season_price')
    `, [process.env.DB_NAME]);

    console.log('📊 Existing pricing columns:', columns.map(col => col.COLUMN_NAME));

    if (columns.length === 0) {
      // Add new pricing columns
      console.log('🔧 Adding new pricing columns...');
      
      await connection.execute(`
        ALTER TABLE villa_types 
        ADD COLUMN weekday_price DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN weekend_price DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN high_season_price DECIMAL(10,2) DEFAULT 0
      `);

      console.log('✅ Successfully added pricing columns!');

      // Migrate existing price data to new structure
      console.log('🔄 Migrating existing price data...');
      
      await connection.execute(`
        UPDATE villa_types 
        SET weekday_price = price,
            weekend_price = price * 1.2,
            high_season_price = price * 1.5
        WHERE weekday_price = 0
      `);

      console.log('✅ Successfully migrated price data!');
      console.log('📋 Migration strategy:');
      console.log('   - Weekday price = current price');
      console.log('   - Weekend price = current price + 20%');
      console.log('   - High season price = current price + 50%');

    } else if (columns.length < 3) {
      console.log('⚠️  Some pricing columns are missing. Adding missing columns...');
      
      const existingColumns = columns.map(col => col.COLUMN_NAME);
      
      if (!existingColumns.includes('weekday_price')) {
        await connection.execute('ALTER TABLE villa_types ADD COLUMN weekday_price DECIMAL(10,2) DEFAULT 0');
        console.log('✅ Added weekday_price column');
      }
      
      if (!existingColumns.includes('weekend_price')) {
        await connection.execute('ALTER TABLE villa_types ADD COLUMN weekend_price DECIMAL(10,2) DEFAULT 0');
        console.log('✅ Added weekend_price column');
      }
      
      if (!existingColumns.includes('high_season_price')) {
        await connection.execute('ALTER TABLE villa_types ADD COLUMN high_season_price DECIMAL(10,2) DEFAULT 0');
        console.log('✅ Added high_season_price column');
      }

      // Migrate data for newly added columns
      await connection.execute(`
        UPDATE villa_types 
        SET weekday_price = CASE WHEN weekday_price = 0 THEN price ELSE weekday_price END,
            weekend_price = CASE WHEN weekend_price = 0 THEN price * 1.2 ELSE weekend_price END,
            high_season_price = CASE WHEN high_season_price = 0 THEN price * 1.5 ELSE high_season_price END
      `);

      console.log('✅ Migration completed!');
    } else {
      console.log('✅ All pricing columns already exist!');
    }

    // Show current villa pricing structure
    const [villas] = await connection.execute(`
      SELECT id, title, price, weekday_price, weekend_price, high_season_price 
      FROM villa_types 
      LIMIT 5
    `);

    console.log('\n📊 Current villa pricing structure (first 5 villas):');
    console.table(villas);

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

addPricingColumns();