const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addMoreVillas() {
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

    // Add more villa data
    const villas = [
      {
        slug: 'modern-pool-villa',
        title: 'Modern Pool Villa',
        description: 'Villa modern dengan kolam renang pribadi',
        long_description: 'Villa modern yang menakjubkan dengan kolam renang pribadi infinity, desain kontemporer, dan fasilitas mewah lengkap.',
        price: 3500000,
        location: 'Dieng Plateau, Banjarnegara',
        size: '180m²',
        max_guests: 4,
        status: 'inactive'
      },
      {
        slug: 'garden-villa-suite',
        title: 'Garden Villa Suite',
        description: 'Suite villa dengan taman yang indah',
        long_description: 'Suite villa yang dikelilingi taman tropis yang rimbun, memberikan pengalaman menginap yang tenang dan menyegarkan.',
        price: 2800000,
        location: 'Batur Highland, Banjarnegara',
        size: '150m²',
        max_guests: 3,
        status: 'inactive'
      },
      {
        slug: 'beachfront-villa',
        title: 'Beachfront Villa',
        description: 'Villa tepi pantai dengan akses langsung ke beach',
        long_description: 'Villa mewah di tepi pantai dengan akses langsung ke pantai berpasir putih, pemandangan laut yang spektakuler.',
        price: 4200000,
        location: 'Sumberejo Valley, Banjarnegara',
        size: '220m²',
        max_guests: 6,
        status: 'inactive'
      },
      {
        slug: 'mountain-view-villa',
        title: 'Mountain View Villa',
        description: 'Villa dengan pemandangan pegunungan yang spektakuler',
        long_description: 'Villa dengan arsitektur unik yang menawarkan pemandangan pegunungan dan lembah yang menakjubkan.',
        price: 3200000,
        location: 'Wonosobo Highland, Jawa Tengah',
        size: '190m²',
        max_guests: 5,
        status: 'inactive'
      },
      {
        slug: 'tropical-paradise-villa',
        title: 'Tropical Paradise Villa',
        description: 'Villa tropis di tengah keindahan alam',
        long_description: 'Villa tropis yang dikelilingi hamparan sawah dan hutan tropis, memberikan pengalaman liburan yang autentik.',
        price: 2900000,
        location: 'Dieng Valley, Jawa Tengah',
        size: '170m²',
        max_guests: 4,
        status: 'inactive'
      }
    ];

    console.log('🏠 Adding villa data...');

    for (const villa of villas) {
      // Insert villa
      const [result] = await connection.execute(`
        INSERT INTO villa_types (slug, title, description, long_description, price, location, size, max_guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [villa.slug, villa.title, villa.description, villa.long_description, villa.price, villa.location, villa.size, villa.max_guests, villa.status]);

      const villaId = result.insertId;
      console.log(`✅ Added villa: ${villa.title} (ID: ${villaId})`);

      // Add amenities for each villa
      const amenities = [
        { icon: 'fas fa-wifi', text: 'WiFi Gratis' },
        { icon: 'fas fa-swimmer', text: 'Kolam Renang' },
        { icon: 'fas fa-car', text: 'Parkir Gratis' },
        { icon: 'fas fa-utensils', text: 'Dapur Lengkap' },
        { icon: 'fas fa-snowflake', text: 'Air Conditioning' }
      ];

      for (const amenity of amenities) {
        await connection.execute(
          'INSERT INTO villa_amenities (villa_id, icon, text) VALUES (?, ?, ?)',
          [villaId, amenity.icon, amenity.text]
        );
      }

      // Add features for each villa
      const features = [
        'Kamar tidur dengan AC',
        'Kamar mandi pribadi',
        'Balkon/Teras pribadi',
        'TV layar datar',
        'Mini bar',
        'Safe deposit box'
      ];

      for (const feature of features) {
        await connection.execute(
          'INSERT INTO villa_features (villa_id, feature_text) VALUES (?, ?)',
          [villaId, feature]
        );
      }

      // Add sample images
      const images = [
        {
          image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          alt_text: villa.title,
          is_primary: true,
          sort_order: 0
        },
        {
          image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          alt_text: `${villa.title} - Interior`,
          is_primary: false,
          sort_order: 1
        }
      ];

      for (const image of images) {
        await connection.execute(
          'INSERT INTO villa_images (villa_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)',
          [villaId, image.image_url, image.alt_text, image.is_primary, image.sort_order]
        );
      }
    }

    console.log('✅ All villa data added successfully!');
    console.log(`📊 Added ${villas.length} new villas`);

  } catch (error) {
    console.error('❌ Error adding villa data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

addMoreVillas();