-- Update existing admin user credentials
-- Username: Villadiengluxury
-- Password: Mandadanyumna

-- First, update username from 'admin' to 'Villadiengluxury' if exists
UPDATE admin_users 
SET 
  username = 'Villadiengluxury',
  password_hash = '$2b$10$ZPqZl.wigwtV8NL3JU50u.REDFnRcBPoRF1xNkwEFCA5MFeRD9iUy',
  email = 'villadiengluxury@gmail.com'
WHERE username = 'admin';

-- If no existing admin user, insert new one
INSERT IGNORE INTO admin_users (username, email, password_hash, role) VALUES 
('Villadiengluxury', 'villadiengluxury@gmail.com', '$2b$10$ZPqZl.wigwtV8NL3JU50u.REDFnRcBPoRF1xNkwEFCA5MFeRD9iUy', 'super_admin');

-- Verify the update
SELECT username, email, role FROM admin_users WHERE username = 'Villadiengluxury';