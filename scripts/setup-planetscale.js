const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupPlanetScaleDatabase() {
  let connection;
  
  try {
    console.log('🔗 Connecting to PlanetScale database...');
    
    // Always use individual parameters to avoid URL encoding issues
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

    console.log('✅ Connected to PlanetScale database successfully!');

    // Check if tables exist
    const [tables] = await connection.execute("SHOW TABLES");
    console.log(`📊 Found ${tables.length} existing tables`);

    // Create tables if they don't exist
    console.log('🔨 Creating database schema...');

    // 1. Villa Types Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS villa_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        long_description TEXT,
        price DECIMAL(10,2) NOT NULL,
        location VARCHAR(255),
        size VARCHAR(100),
        max_guests INT DEFAULT 2,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 2. Villa Amenities Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS villa_amenities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        villa_id INT NOT NULL,
        icon VARCHAR(100),
        text VARCHAR(255) NOT NULL,
        FOREIGN KEY (villa_id) REFERENCES villa_types(id) ON DELETE CASCADE
      )
    `);

    // 3. Villa Features Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS villa_features (
        id INT AUTO_INCREMENT PRIMARY KEY,
        villa_id INT NOT NULL,
        feature_text VARCHAR(255) NOT NULL,
        FOREIGN KEY (villa_id) REFERENCES villa_types(id) ON DELETE CASCADE
      )
    `);

    // 4. Villa Images Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS villa_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        villa_id INT NOT NULL,
        image_url TEXT NOT NULL,
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        FOREIGN KEY (villa_id) REFERENCES villa_types(id) ON DELETE CASCADE
      )
    `);

    // 5. Gallery Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        alt_text VARCHAR(255),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 6. Bookings Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        villa_id INT NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50),
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        num_guests INT NOT NULL,
        total_price DECIMAL(10,2),
        special_requests TEXT,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (villa_id) REFERENCES villa_types(id) ON DELETE CASCADE
      )
    `);

    // 7. Admin Users Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        full_name VARCHAR(255),
        role ENUM('admin', 'super_admin') DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database schema created successfully!');

    // Insert sample data if tables are empty
    const [villaCount] = await connection.execute("SELECT COUNT(*) as count FROM villa_types");
    if (villaCount[0].count === 0) {
      console.log('📝 Inserting sample data...');
      
      // Insert sample villa
      const [villaResult] = await connection.execute(`
        INSERT INTO villa_types (slug, title, description, long_description, price, location, size, max_guests)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'luxury-ocean-villa',
        'Luxury Ocean Villa',
        'Villa mewah dengan pemandangan laut yang menakjubkan',
        'Villa mewah ini menawarkan pengalaman tak terlupakan dengan pemandangan laut yang spektakuler. Dilengkapi dengan fasilitas modern dan pelayanan terbaik.',
        2500000,
        'Bali, Indonesia',
        '200m²',
        4
      ]);

      const villaId = villaResult.insertId;

      // Insert sample amenities
      const amenities = [
        { icon: 'fas fa-wifi', text: 'WiFi Gratis' },
        { icon: 'fas fa-swimmer', text: 'Kolam Renang Pribadi' },
        { icon: 'fas fa-car', text: 'Parkir Gratis' },
        { icon: 'fas fa-utensils', text: 'Dapur Lengkap' }
      ];

      for (const amenity of amenities) {
        await connection.execute(
          'INSERT INTO villa_amenities (villa_id, icon, text) VALUES (?, ?, ?)',
          [villaId, amenity.icon, amenity.text]
        );
      }

      // Insert sample features
      const features = [
        'AC di setiap ruangan',
        'TV layar datar',
        'Balkon dengan pemandangan laut',
        'Kamar mandi pribadi dengan shower'
      ];

      for (const feature of features) {
        await connection.execute(
          'INSERT INTO villa_features (villa_id, feature_text) VALUES (?, ?)',
          [villaId, feature]
        );
      }

      // Insert sample images
      await connection.execute(
        'INSERT INTO villa_images (villa_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
        [villaId, 'https://images.unsplash.com/photo-1566073771259-6a8506099945', 'Luxury Ocean Villa', true, 0]
      );

      console.log('✅ Sample data inserted successfully!');
    }

    // Create default admin user if not exists
    const [adminCount] = await connection.execute("SELECT COUNT(*) as count FROM admin_users WHERE username = 'admin'");
    if (adminCount[0].count === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || 'admin123', 10);
      
      await connection.execute(`
        INSERT INTO admin_users (username, password_hash, email, full_name, role)
        VALUES (?, ?, ?, ?, ?)
      `, ['admin', hashedPassword, 'admin@villaluxury.com', 'Administrator', 'super_admin']);
      
      console.log('✅ Default admin user created!');
      console.log('   Username: admin');
      console.log('   Password: ' + (process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'));
    }

    console.log('🎉 PlanetScale database setup completed successfully!');
    console.log('📍 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupPlanetScaleDatabase();