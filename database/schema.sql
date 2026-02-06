-- Villa Paradise Database Schema

-- Tabel untuk menyimpan data villa/room types
CREATE TABLE villa_types (
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
);

-- Tabel untuk amenities villa
CREATE TABLE villa_amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  villa_id INT,
  icon VARCHAR(100),
  text VARCHAR(255),
  FOREIGN KEY (villa_id) REFERENCES villa_types(id) ON DELETE CASCADE
);

-- Tabel untuk features villa
CREATE TABLE villa_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  villa_id INT,
  feature_text TEXT,
  FOREIGN KEY (villa_id) REFERENCES villa_types(id) ON DELETE CASCADE
);

-- Tabel untuk gallery images
CREATE TABLE villa_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  villa_id INT,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (villa_id) REFERENCES villa_types(id) ON DELETE CASCADE
);

-- Tabel untuk bookings
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  villa_id INT,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INT DEFAULT 1,
  extra_bed_count INT DEFAULT 0,
  extra_bed_price DECIMAL(10,2) DEFAULT 0,
  extra_bed_total DECIMAL(10,2) DEFAULT 0,
  total_nights INT,
  total_price DECIMAL(10,2),
  special_requests TEXT,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  booking_source ENUM('website', 'whatsapp', 'phone', 'admin') DEFAULT 'website',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (villa_id) REFERENCES villa_types(id)
);

-- Tabel untuk admin users
CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'staff') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk settings website
CREATE TABLE site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default data
INSERT INTO villa_types (slug, title, description, long_description, price, location, size, max_guests) VALUES
('deluxe-villa', 'Deluxe Villa', 'Villa mewah dengan pemandangan taman tropis dan kolam renang pribadi yang sempurna untuk liburan romantis atau keluarga kecil.', 'Nikmati kemewahan dan kenyamanan di Deluxe Villa kami yang dirancang dengan sempurna. Villa ini menawarkan pemandangan taman tropis yang memukau dan kolam renang pribadi untuk pengalaman menginap yang tak terlupakan. Dengan desain modern dan fasilitas lengkap, villa ini cocok untuk pasangan yang ingin menikmati bulan madu atau keluarga kecil yang mencari liburan berkualitas.', 299.00, 'Zona Taman Tropis', '120m²', 4),
('ocean-view-villa', 'Ocean View Villa', 'Villa premium dengan pemandangan laut yang menakjubkan dan akses pantai pribadi.', 'Rasakan kemewahan sejati di Ocean View Villa dengan pemandangan laut yang spektakuler. Villa ini menawarkan akses langsung ke pantai pribadi dan fasilitas premium yang akan membuat pengalaman menginap Anda istimewa. Desain villa yang elegan dengan sentuhan modern memberikan kenyamanan maksimal sambil menikmati keindahan alam laut tropis.', 459.00, 'Zona Tepi Pantai', '180m²', 6),
('presidential-suite', 'Presidential Suite', 'Suite mewah terluas dengan semua fasilitas premium dan butler pribadi.', 'Presidential Suite adalah puncak kemewahan di Yumna Villa Dieng. Dengan luas terbesar dan fasilitas paling lengkap, suite ini menawarkan pengalaman menginap yang tak tertandingi. Dilengkapi dengan butler pribadi dan semua fasilitas premium, Presidential Suite cocok untuk tamu VIP atau acara spesial yang membutuhkan kemewahan ekstra.', 799.00, 'Zona Premium Hilltop', '350m²', 8);

-- Insert amenities
INSERT INTO villa_amenities (villa_id, icon, text) VALUES
(1, 'fas fa-bed', '2 Kamar Tidur'),
(1, 'fas fa-bath', '2 Kamar Mandi'),
(1, 'fas fa-swimming-pool', 'Private Pool'),
(1, 'fas fa-wifi', 'Free WiFi'),
(1, 'fas fa-car', 'Parking'),
(1, 'fas fa-coffee', 'Kitchen'),
(2, 'fas fa-bed', '3 Kamar Tidur'),
(2, 'fas fa-bath', '3 Kamar Mandi'),
(2, 'fas fa-water', 'Beach Access'),
(2, 'fas fa-swimming-pool', 'Infinity Pool'),
(2, 'fas fa-wifi', 'Free WiFi'),
(2, 'fas fa-utensils', 'Private Chef Available'),
(3, 'fas fa-bed', '4 Kamar Tidur'),
(3, 'fas fa-bath', '4 Kamar Mandi'),
(3, 'fas fa-user-tie', 'Private Butler'),
(3, 'fas fa-swimming-pool', 'Private Pool & Jacuzzi'),
(3, 'fas fa-car', 'Chauffeur Service'),
(3, 'fas fa-spa', 'In-Villa Spa');

-- Insert features
INSERT INTO villa_features (villa_id, feature_text) VALUES
(1, 'Air conditioning di semua ruangan'),
(1, 'Smart TV dengan Netflix'),
(1, 'Mini bar dan kulkas'),
(1, 'Safe deposit box'),
(1, 'Hair dryer dan amenities mandi'),
(1, 'Teras pribadi dengan furniture outdoor'),
(1, 'Layanan housekeeping harian'),
(1, 'Concierge service 24/7'),
(2, 'Pemandangan laut 180 derajat'),
(2, 'Akses pantai pribadi eksklusif'),
(2, 'Infinity pool menghadap laut'),
(2, 'Jacuzzi outdoor'),
(2, 'Butler service tersedia'),
(2, 'Private dining area'),
(2, 'Kayak dan snorkeling gear'),
(2, 'Sunset deck dengan bar area'),
(3, 'Butler pribadi 24/7'),
(3, 'Chauffeur dan mobil mewah'),
(3, 'Private spa dan massage room'),
(3, 'Wine cellar dan premium bar'),
(3, 'Private dining room untuk 12 orang'),
(3, 'Home theater dan game room'),
(3, 'Office space dengan meeting room'),
(3, 'Helicopter landing pad access');

-- Insert default admin user (username: Villadiengluxury, password: Mandadanyumna)
INSERT INTO admin_users (username, email, password_hash, role) VALUES 
('Villadiengluxury', 'villadiengluxury@gmail.com', '$2b$10$ZPqZl.wigwtV8NL3JU50u.REDFnRcBPoRF1xNkwEFCA5MFeRD9iUy', 'super_admin');

-- Insert site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'Yumna Villa Dieng', 'text', 'Website name'),
('site_description', 'Pengalaman Villa Mewah yang Tak Terlupakan', 'text', 'Website description'),
('contact_phone', '+622136296229', 'text', 'Contact phone number'),
('contact_email', 'villadiengluxury@gmail.com', 'text', 'Contact email'),
('whatsapp_number', '+622136296229', 'text', 'WhatsApp number for booking'),
('booking_advance_days', '365', 'number', 'How many days in advance booking can be made'),
('min_booking_nights', '1', 'number', 'Minimum nights for booking'),
('max_booking_nights', '30', 'number', 'Maximum nights for booking');