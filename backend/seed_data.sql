-- Database Seed Data for Restaurant App (Integer IDs)
-- Clear any existing data
TRUNCATE TABLE order_items, orders, food_items, categories, restaurant_tables, pincodes, home_sliders, offers, admin_users, roles, public_users, locations RESTART IDENTITY CASCADE;

-- 1. Seed Roles
INSERT INTO roles (name, description, permissions, is_active, created_at) VALUES 
('admin', 'Super Admin with full access', 'dashboard:view,categories:manage,menu:manage,tables:manage,locations:manage,qr-codes:manage,users:manage,roles:manage', true, NOW());

-- 2. Seed Admin Users (Password: 123456)
INSERT INTO admin_users (name, email, password_hash, role, location_ids, is_active, created_at) VALUES 
('Admin User', 'admin@example.com', '$2a$10$2Lscf4WDXvnzfUvpGjCXWuk6uDk4mcQQiYRmSKzSZiZWT0GZlaw4.', 'admin', '', true, NOW());

-- 3. Seed Locations
INSERT INTO locations (name, address, city, phone, qr_code_token, is_active, created_at, updated_at) VALUES 
('Main Branch', '123 Gourmet Street', 'Hyderabad', '9876543210', 'loc_main_branch_001', true, NOW(), NOW()),
('Downtown Cafe', '456 Central Ave', 'Hyderabad', '9876543211', 'loc_downtown_002', true, NOW(), NOW());

-- 4. Seed Categories (Using real images from uploads)
INSERT INTO categories (name, icon, image_url, sort_order, is_active) VALUES 
('Snacks', '🥟', '/uploads/cat_snacks.png', 1, true),
('Dosa', '🥞', '/uploads/cat_dosa.png', 2, true),
('Rice & Biryani', '🍛', '/uploads/cat_rice_biryani.png', 3, true),
('Curries', '🥘', '/uploads/cat_curries.png', 4, true),
('Breads', '🍞', '/uploads/cat_breads.png', 5, true),
('Desserts', '🍰', '/uploads/cat_desserts.png', 6, true),
('Drinks', '🥤', '/uploads/cat_drinks.png', 7, true),
('Tea & Coffee', '☕', '/uploads/cat_tea_coffee.png', 8, true),
('Milk Products', '🥛', '/uploads/cat_milk.png', 9, true),
('All Items', '🍴', '/uploads/cat_all.png', 10, true);

-- 5. Seed Food Items
-- Assuming Location 1 and Category IDs based on order above
INSERT INTO food_items (name, description, price, is_veg, is_available, preparation_time, rating, location_id, category_id, image_url, created_at, updated_at) VALUES 
('Samosa', 'Crispy vegetable samosas', 40.00, true, true, 10, 4.5, 1, 1, '/uploads/cat_snacks.png', NOW(), NOW()),
('Masala Dosa', 'Traditional South Indian dosa', 120.00, true, true, 15, 4.8, 1, 2, '/uploads/cat_dosa.png', NOW(), NOW()),
('Chicken Biryani', 'Aromatic spiced rice with chicken', 350.00, false, true, 25, 4.9, 1, 3, '/uploads/cat_rice_biryani.png', NOW(), NOW()),
('Paneer Butter Masala', 'Creamy paneer curry', 280.00, true, true, 20, 4.7, 1, 4, '/uploads/cat_curries.png', NOW(), NOW()),
('Butter Naan', 'Soft clay-oven bread', 50.00, true, true, 5, 4.6, 1, 5, '/uploads/cat_breads.png', NOW(), NOW()),
('Gulab Jamun', 'Sweet milk-solid dumplings', 100.00, true, true, 10, 4.8, 1, 6, '/uploads/cat_desserts.png', NOW(), NOW()),
('Mango Lassi', 'Sweet mango yogurt drink', 80.00, true, true, 5, 4.2, 1, 7, '/uploads/cat_drinks.png', NOW(), NOW()),
('Masala Tea', 'Spiced Indian tea', 30.00, true, true, 5, 4.4, 1, 8, '/uploads/cat_tea_coffee.png', NOW(), NOW());

-- 6. Seed Restaurant Tables
INSERT INTO restaurant_tables (table_number, capacity, is_available, location_id) VALUES 
('T1', 2, true, 1),
('T2', 4, true, 1),
('T3', 4, true, 1),
('T4', 6, true, 1),
('D1', 4, true, 2),
('D2', 2, true, 2);

-- 7. Seed Offers
INSERT INTO offers (title, description, promo_code, min_amount, discount_amount, type, is_active, created_at, updated_at) VALUES 
('Welcome Discount', 'Get 10% off on your first order', 'WELCOME10', 500.00, 10.00, 'percentage', true, NOW(), NOW()),
('Mega Deal', 'Flat 100 off on orders above 1000', 'MEGA100', 1000.00, 100.00, 'fixed', true, NOW(), NOW());

-- 8. Seed Home Sliders (Using real images)
INSERT INTO home_sliders (image_url, title, subtitle, sort_order, is_active) VALUES 
('/uploads/sample_slider.png', 'Delicious Deals', 'Up to 50% off on selected items', 1, true),
('/uploads/slider_2.png', 'Foodies Paradise', 'Join our loyalty program', 2, true);

-- 9. Seed Pincodes
INSERT INTO pincodes (pincode, area_name, location_id, delivery_charge, min_order_amount, estimated_delivery_time, is_active, created_at, updated_at) VALUES 
('500072', 'KPHB Colony', 1, 30.00, 200.00, '30-40 mins', true, NOW(), NOW()),
('500081', 'Hitech City', 1, 40.00, 300.00, '40-50 mins', true, NOW(), NOW());
