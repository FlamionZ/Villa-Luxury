-- Supabase/PostgreSQL schema for Yumna Villa Dieng

-- Villa types
CREATE TABLE IF NOT EXISTS villa_types (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  weekday_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  weekend_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  high_season_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  location TEXT,
  size TEXT,
  max_guests INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Villa amenities
CREATE TABLE IF NOT EXISTS villa_amenities (
  id BIGSERIAL PRIMARY KEY,
  villa_id BIGINT NOT NULL REFERENCES villa_types(id) ON DELETE CASCADE,
  icon TEXT,
  text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Villa features
CREATE TABLE IF NOT EXISTS villa_features (
  id BIGSERIAL PRIMARY KEY,
  villa_id BIGINT NOT NULL REFERENCES villa_types(id) ON DELETE CASCADE,
  feature_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Villa images
CREATE TABLE IF NOT EXISTS villa_images (
  id BIGSERIAL PRIMARY KEY,
  villa_id BIGINT NOT NULL REFERENCES villa_types(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  villa_id BIGINT NOT NULL REFERENCES villa_types(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  num_guests INTEGER NOT NULL DEFAULT 1,
  extra_bed_count INTEGER NOT NULL DEFAULT 0,
  extra_bed_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  extra_bed_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_nights INTEGER,
  total_price NUMERIC(12,2),
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed','rejected')),
  booking_source TEXT NOT NULL DEFAULT 'website' CHECK (booking_source IN ('website','whatsapp','phone','admin','email','walk-in')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin','admin','staff')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT NOT NULL DEFAULT 'text' CHECK (setting_type IN ('text','number','boolean','json')),
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_villa_status ON villa_types(status);
CREATE INDEX IF NOT EXISTS idx_villa_created ON villa_types(created_at);
CREATE INDEX IF NOT EXISTS idx_amenities_villa ON villa_amenities(villa_id);
CREATE INDEX IF NOT EXISTS idx_features_villa ON villa_features(villa_id);
CREATE INDEX IF NOT EXISTS idx_images_villa ON villa_images(villa_id);
CREATE INDEX IF NOT EXISTS idx_images_primary ON villa_images(villa_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_bookings_villa ON bookings(villa_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(is_active);
