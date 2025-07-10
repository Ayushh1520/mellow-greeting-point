
-- Insert sample categories
INSERT INTO public.categories (id, name, description, image_url) VALUES
('cat-1', 'Electronics', 'Latest electronic gadgets and devices', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500'),
('cat-2', 'Fashion', 'Trendy clothing and accessories', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500'),
('cat-3', 'Home & Garden', 'Home improvement and garden essentials', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'),
('cat-4', 'Sports', 'Sports equipment and fitness gear', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'),
('cat-5', 'Books', 'Books and educational materials', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500')
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (id, name, description, price, original_price, discount_percentage, category_id, brand, image_url, images, rating, review_count, stock_quantity) VALUES
-- Electronics
('prod-1', 'iPhone 15 Pro', 'Latest iPhone with A17 Pro chip and titanium design', 999.99, 1199.99, 17, 'cat-1', 'Apple', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', '["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500"]', 4.8, 245, 50),
('prod-2', 'Samsung Galaxy S24', 'Flagship Android phone with AI features', 799.99, 899.99, 11, 'cat-1', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"]', 4.6, 189, 75),
('prod-3', 'MacBook Air M3', 'Ultra-thin laptop with M3 chip', 1299.99, 1399.99, 7, 'cat-1', 'Apple', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"]', 4.9, 156, 30),
('prod-4', 'Sony WH-1000XM5', 'Premium noise-canceling headphones', 349.99, 399.99, 13, 'cat-1', 'Sony', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"]', 4.7, 298, 120),

-- Fashion
('prod-5', 'Nike Air Jordan 1', 'Classic basketball sneakers', 170.00, 200.00, 15, 'cat-2', 'Nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"]', 4.5, 342, 85),
('prod-6', 'Levi''s 501 Jeans', 'Original fit denim jeans', 89.99, 109.99, 18, 'cat-2', 'Levi''s', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500', '["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500"]', 4.3, 167, 200),
('prod-7', 'Ray-Ban Aviator', 'Classic aviator sunglasses', 154.99, 179.99, 14, 'cat-2', 'Ray-Ban', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', '["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500"]', 4.6, 89, 150),
('prod-8', 'Adidas Hoodie', 'Comfortable cotton blend hoodie', 59.99, 79.99, 25, 'cat-2', 'Adidas', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', '["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"]', 4.4, 123, 300),

-- Home & Garden
('prod-9', 'KitchenAid Stand Mixer', 'Professional 5-quart stand mixer', 379.99, 449.99, 16, 'cat-3', 'KitchenAid', 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500', '["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500"]', 4.8, 234, 45),
('prod-10', 'Dyson V15 Detect', 'Cordless vacuum with laser detection', 649.99, 749.99, 13, 'cat-3', 'Dyson', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]', 4.7, 178, 60),
('prod-11', 'Garden Tool Set', 'Complete 10-piece garden tool kit', 89.99, 119.99, 25, 'cat-3', 'GreenThumb', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500', '["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500"]', 4.2, 67, 150),

-- Sports
('prod-12', 'Yoga Mat Premium', 'Non-slip eco-friendly yoga mat', 49.99, 69.99, 29, 'cat-4', 'YogaLife', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500', '["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500"]', 4.5, 145, 200),
('prod-13', 'Dumbbells Set', 'Adjustable weight dumbbell set', 299.99, 399.99, 25, 'cat-4', 'FitPro', 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=500', '["https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=500"]', 4.6, 89, 75),
('prod-14', 'Tennis Racket', 'Professional tennis racket', 159.99, 199.99, 20, 'cat-4', 'Wilson', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', '["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500"]', 4.4, 56, 100),

-- Books
('prod-15', 'Programming Book Set', 'Complete guide to modern programming', 79.99, 99.99, 20, 'cat-5', 'TechBooks', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500"]', 4.7, 234, 500),
('prod-16', 'Art Supplies Kit', 'Professional drawing and painting set', 129.99, 159.99, 19, 'cat-5', 'ArtMaster', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', '["https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500"]', 4.3, 78, 120),
('prod-17', 'Cookbook Collection', 'Best recipes from around the world', 39.99, 49.99, 20, 'cat-5', 'CookingPro', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500', '["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500"]', 4.5, 167, 300);
