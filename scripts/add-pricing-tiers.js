const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addPricingTiers() {
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

    if (columns.length > 0) {
      console.log('📋 Pricing tier columns already exist. Skipping migration.');
      return;
    }

    console.log('🏗️ Adding pricing tier columns...');

    // Add new pricing columns
    await connection.execute(`
      ALTER TABLE villa_types 
      ADD COLUMN weekday_price DECIMAL(10,2) DEFAULT NULL AFTER price,
      ADD COLUMN weekend_price DECIMAL(10,2) DEFAULT NULL AFTER weekday_price,
      ADD COLUMN high_season_price DECIMAL(10,2) DEFAULT NULL AFTER weekend_price
    `);

    console.log('✅ Added pricing tier columns successfully!');

    // Migrate existing price data to all three tiers
    await connection.execute(`
      UPDATE villa_types 
      SET 
        weekday_price = price,
        weekend_price = price * 1.2,
        high_season_price = price * 1.5
      WHERE price IS NOT NULL
    `);

    console.log('✅ Migrated existing price data to tiered pricing!');
    console.log('📊 Pricing strategy:');
    console.log('   - Weekday: Original price');
    console.log('   - Weekend: Original price + 20%');
    console.log('   - High Season: Original price + 50%');

  } catch (error) {
    console.error('❌ Error adding pricing tiers:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
addPricingTiers()
  .then(() => {
    console.log('🎉 Pricing tier migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });