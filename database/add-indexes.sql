-- 🚀 Database Performance Optimization - Critical Indexes
-- Villa Paradise Performance Boost
-- Safe to apply - only adds indexes, no data modification

-- 1. Villa Types Indexes (Most Critical)
CREATE INDEX IF NOT EXISTS idx_villa_status ON villa_types(status);
CREATE INDEX IF NOT EXISTS idx_villa_created ON villa_types(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_villa_status_created ON villa_types(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_villa_slug ON villa_types(slug);

-- 2. Villa Amenities Indexes
CREATE INDEX IF NOT EXISTS idx_amenities_villa ON villa_amenities(villa_id);

-- 3. Villa Features Indexes  
CREATE INDEX IF NOT EXISTS idx_features_villa ON villa_features(villa_id);

-- 4. Villa Images Indexes (Critical for loading)
CREATE INDEX IF NOT EXISTS idx_images_villa ON villa_images(villa_id);
CREATE INDEX IF NOT EXISTS idx_images_primary ON villa_images(villa_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_images_sort ON villa_images(villa_id, sort_order);

-- 5. Bookings Indexes (for availability checks)
CREATE INDEX IF NOT EXISTS idx_bookings_villa ON bookings(villa_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_availability ON bookings(villa_id, status, check_in, check_out);

-- 6. Admin Users Index
CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);

-- Verify indexes created
SHOW INDEX FROM villa_types;
SHOW INDEX FROM villa_amenities;
SHOW INDEX FROM villa_features;
SHOW INDEX FROM villa_images;
SHOW INDEX FROM bookings;