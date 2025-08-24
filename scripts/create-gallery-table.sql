-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) DEFAULT '',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some default gallery images
INSERT INTO gallery (title, description, image_url, alt_text, display_order, is_active) VALUES
('Villa Exterior', 'Beautiful villa exterior with modern architecture', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'Villa Exterior', 1, TRUE),
('Luxury Bedroom', 'Spacious bedroom with premium furnishing', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'Bedroom', 2, TRUE),
('Pool Area', 'Private pool with stunning view', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'Pool Area', 3, TRUE),
('Living Room', 'Modern living room with comfortable seating', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'Living Room', 4, TRUE),
('Bathroom', 'Luxurious bathroom with modern fixtures', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'Bathroom', 5, TRUE),
('Dining Area', 'Elegant dining area for memorable meals', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'Dining Area', 6, TRUE);