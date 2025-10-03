-- Update sample villa with pricing data
UPDATE villa_types 
SET 
  weekday_price = 2500000,
  weekend_price = 3000000, 
  high_season_price = 3750000
WHERE slug = 'modern-pool-villa';

-- Insert a new test villa with complete pricing if not exists
INSERT IGNORE INTO villa_types (
  slug, title, description, long_description, price, 
  weekday_price, weekend_price, high_season_price,
  location, size, max_guests, status
) VALUES (
  'test-pricing-villa',
  'Test Pricing Villa',
  'Villa untuk testing pricing system',
  'Villa ini dibuat khusus untuk menguji sistem pricing bertingkat dengan 3 kategori harga yang berbeda.',
  2500000,
  2500000,
  3000000,
  3750000,
  'Bali',
  '150m2',
  4,
  'active'
);

-- Add some amenities for the test villa
INSERT IGNORE INTO villa_amenities (villa_id, icon, text) 
SELECT id, 'fas fa-wifi', 'WiFi Gratis' FROM villa_types WHERE slug = 'test-pricing-villa'
UNION ALL
SELECT id, 'fas fa-swimming-pool', 'Kolam Renang Pribadi' FROM villa_types WHERE slug = 'test-pricing-villa'
UNION ALL  
SELECT id, 'fas fa-car', 'Parkir Gratis' FROM villa_types WHERE slug = 'test-pricing-villa'
UNION ALL
SELECT id, 'fas fa-wind', 'AC di Semua Ruangan' FROM villa_types WHERE slug = 'test-pricing-villa';

-- Add some features for the test villa
INSERT IGNORE INTO villa_features (villa_id, feature_text)
SELECT id, 'Kolam Renang Infinity' FROM villa_types WHERE slug = 'test-pricing-villa'
UNION ALL
SELECT id, 'Pemandangan Laut' FROM villa_types WHERE slug = 'test-pricing-villa'
UNION ALL
SELECT id, 'Dapur Lengkap' FROM villa_types WHERE slug = 'test-pricing-villa'
UNION ALL
SELECT id, 'Ruang Tamu Luas' FROM villa_types WHERE slug = 'test-pricing-villa';