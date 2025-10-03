const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addGalleryData() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    
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

    // Gallery data dengan URL Unsplash yang valid
    const galleryItems = [
      {
        title: 'Luxury Ocean Villa',
        description: 'Villa mewah dengan pemandangan laut yang menakjubkan',
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt_text: 'Luxury Ocean Villa',
        display_order: 1
      },
      {
        title: 'Modern Pool Villa',
        description: 'Villa modern dengan kolam renang pribadi',
        image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt_text: 'Modern Pool Villa',
        display_order: 2
      },
      {
        title: 'Garden Villa Suite',
        description: 'Suite villa dengan taman yang indah',
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt_text: 'Garden Villa Suite',
        display_order: 3
      },
      {
        title: 'Beachfront Villa',
        description: 'Villa tepi pantai dengan akses langsung ke beach',
        image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt_text: 'Beachfront Villa',
        display_order: 4
      },
      {
        title: 'Mountain View Villa',
        description: 'Villa dengan pemandangan pegunungan yang spektakuler',
        image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt_text: 'Mountain View Villa',
        display_order: 5
      },
      {
        title: 'Tropical Paradise Villa',
        description: 'Villa tropis di tengah keindahan alam',
        image_url: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt_text: 'Tropical Paradise Villa',
        display_order: 6
      }
    ];

    console.log('📸 Adding gallery data...');

    for (const item of galleryItems) {
      await connection.execute(`
        INSERT INTO gallery (title, description, image_url, alt_text, display_order)
        VALUES (?, ?, ?, ?, ?)
      `, [item.title, item.description, item.image_url, item.alt_text, item.display_order]);
    }

    console.log('✅ Gallery data added successfully!');
    console.log(`📊 Added ${galleryItems.length} gallery items`);

  } catch (error) {
    console.error('❌ Error adding gallery data:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

addGalleryData();