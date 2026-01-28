-- Seed data for Supabase/PostgreSQL

-- Villa types
INSERT INTO villa_types (slug, title, description, long_description, price, weekday_price, weekend_price, high_season_price, location, size, max_guests, status)
VALUES
('deluxe-villa', 'Deluxe Villa', 'Villa mewah dengan pemandangan taman tropis dan kolam renang pribadi yang sempurna untuk liburan romantis atau keluarga kecil.', 'Nikmati kemewahan dan kenyamanan di Deluxe Villa kami yang dirancang dengan sempurna. Villa ini menawarkan pemandangan taman tropis yang memukau dan kolam renang pribadi untuk pengalaman menginap yang tak terlupakan. Dengan desain modern dan fasilitas lengkap, villa ini cocok untuk pasangan yang ingin menikmati bulan madu atau keluarga kecil yang mencari liburan berkualitas.', 299.00, 299.00, 459.00, 799.00, 'Zona Taman Tropis', '120m²', 4, 'active'),
('ocean-view-villa', 'Ocean View Villa', 'Villa premium dengan pemandangan laut yang menakjubkan dan akses pantai pribadi.', 'Rasakan kemewahan sejati di Ocean View Villa dengan pemandangan laut yang spektakuler. Villa ini menawarkan akses langsung ke pantai pribadi dan fasilitas premium yang akan membuat pengalaman menginap Anda istimewa. Desain villa yang elegan dengan sentuhan modern memberikan kenyamanan maksimal sambil menikmati keindahan alam laut tropis.', 459.00, 459.00, 599.00, 799.00, 'Zona Tepi Pantai', '180m²', 6, 'active'),
('presidential-suite', 'Presidential Suite', 'Suite mewah terluas dengan semua fasilitas premium dan butler pribadi.', 'Presidential Suite adalah puncak kemewahan di Yumna Villa Dieng. Dengan luas terbesar dan fasilitas paling lengkap, suite ini menawarkan pengalaman menginap yang tak tertandingi. Dilengkapi dengan butler pribadi dan semua fasilitas premium, Presidential Suite cocok untuk tamu VIP atau acara spesial yang membutuhkan kemewahan ekstra.', 799.00, 799.00, 999.00, 1200.00, 'Zona Premium Hilltop', '350m²', 8, 'active')
ON CONFLICT (slug) DO NOTHING;

-- Amenities
INSERT INTO villa_amenities (villa_id, icon, text)
SELECT v.id, a.icon, a.text
FROM (
  VALUES
  ('deluxe-villa','fas fa-bed','2 Kamar Tidur'),
  ('deluxe-villa','fas fa-bath','2 Kamar Mandi'),
  ('deluxe-villa','fas fa-swimming-pool','Private Pool'),
  ('deluxe-villa','fas fa-wifi','Free WiFi'),
  ('deluxe-villa','fas fa-car','Parking'),
  ('deluxe-villa','fas fa-coffee','Kitchen'),
  ('ocean-view-villa','fas fa-bed','3 Kamar Tidur'),
  ('ocean-view-villa','fas fa-bath','3 Kamar Mandi'),
  ('ocean-view-villa','fas fa-water','Beach Access'),
  ('ocean-view-villa','fas fa-swimming-pool','Infinity Pool'),
  ('ocean-view-villa','fas fa-wifi','Free WiFi'),
  ('ocean-view-villa','fas fa-utensils','Private Chef Available'),
  ('presidential-suite','fas fa-bed','4 Kamar Tidur'),
  ('presidential-suite','fas fa-bath','4 Kamar Mandi'),
  ('presidential-suite','fas fa-user-tie','Private Butler'),
  ('presidential-suite','fas fa-swimming-pool','Private Pool & Jacuzzi'),
  ('presidential-suite','fas fa-car','Chauffeur Service'),
  ('presidential-suite','fas fa-spa','In-Villa Spa')
) AS a(slug, icon, text)
JOIN villa_types v ON v.slug = a.slug
ON CONFLICT DO NOTHING;

-- Features
INSERT INTO villa_features (villa_id, feature_text)
SELECT v.id, f.feature_text
FROM (
  VALUES
  ('deluxe-villa','Air conditioning di semua ruangan'),
  ('deluxe-villa','Smart TV dengan Netflix'),
  ('deluxe-villa','Mini bar dan kulkas'),
  ('deluxe-villa','Safe deposit box'),
  ('deluxe-villa','Hair dryer dan amenities mandi'),
  ('deluxe-villa','Teras pribadi dengan furniture outdoor'),
  ('deluxe-villa','Layanan housekeeping harian'),
  ('deluxe-villa','Concierge service 24/7'),
  ('ocean-view-villa','Pemandangan laut 180 derajat'),
  ('ocean-view-villa','Akses pantai pribadi eksklusif'),
  ('ocean-view-villa','Infinity pool menghadap laut'),
  ('ocean-view-villa','Jacuzzi outdoor'),
  ('ocean-view-villa','Butler service tersedia'),
  ('ocean-view-villa','Private dining area'),
  ('ocean-view-villa','Kayak dan snorkeling gear'),
  ('ocean-view-villa','Sunset deck dengan bar area'),
  ('presidential-suite','Butler pribadi 24/7'),
  ('presidential-suite','Chauffeur dan mobil mewah'),
  ('presidential-suite','Private spa dan massage room'),
  ('presidential-suite','Wine cellar dan premium bar'),
  ('presidential-suite','Private dining room untuk 12 orang'),
  ('presidential-suite','Home theater dan game room'),
  ('presidential-suite','Office space dengan meeting room'),
  ('presidential-suite','Helicopter landing pad access')
) AS f(slug, feature_text)
JOIN villa_types v ON v.slug = f.slug
ON CONFLICT DO NOTHING;

-- Images (primary placeholders)
INSERT INTO villa_images (villa_id, image_url, alt_text, is_primary, sort_order)
SELECT v.id, i.image_url, i.alt_text, i.is_primary, i.sort_order
FROM (
  VALUES
  ('deluxe-villa','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80','Deluxe Villa', true, 0),
  ('ocean-view-villa','https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80','Ocean View Villa', true, 0),
  ('presidential-suite','https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80','Presidential Suite', true, 0)
) AS i(slug, image_url, alt_text, is_primary, sort_order)
JOIN villa_types v ON v.slug = i.slug
ON CONFLICT DO NOTHING;

-- Admin user (username: Villadiengluxury, password: Mandadanyumna)
INSERT INTO admin_users (username, email, password_hash, role, is_active)
VALUES ('Villadiengluxury', 'villadiengluxury@gmail.com', '$2b$10$ZPqZl.wigwtV8NL3JU50u.REDFnRcBPoRF1xNkwEFCA5MFeRD9iUy', 'super_admin', true)
ON CONFLICT (username) DO NOTHING;

-- Site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
VALUES
('site_name', 'Yumna Villa Dieng', 'text', 'Website name'),
('site_description', 'Pengalaman Villa Mewah yang Tak Terlupakan', 'text', 'Website description'),
('contact_phone', '+62 822-3489-8455', 'text', 'Contact phone number'),
('contact_email', 'villadiengluxury@gmail.com', 'text', 'Contact email'),
('whatsapp_number', '+6282234898455', 'text', 'WhatsApp number for booking'),
('booking_advance_days', '365', 'number', 'How many days in advance booking can be made'),
('min_booking_nights', '1', 'number', 'Minimum nights for booking'),
('max_booking_nights', '30', 'number', 'Maximum nights for booking')
ON CONFLICT (setting_key) DO NOTHING;
