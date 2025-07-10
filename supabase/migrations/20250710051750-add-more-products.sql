
-- Add more electronics products with "pro" in name/brand
INSERT INTO public.products (id, name, description, price, original_price, discount_percentage, category_id, brand, image_url, images, rating, review_count, stock_quantity) VALUES
-- Electronics with "Pro" in name
('prod-18', 'iPad Pro 12.9"', 'Professional tablet with M2 chip and Liquid Retina XDR display', 1099.99, 1299.99, 15, 'cat-1', 'Apple', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500"]', 4.8, 156, 45),
('prod-19', 'MacBook Pro 14"', 'Professional laptop with M3 Pro chip', 1999.99, 2199.99, 9, 'cat-1', 'Apple', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', '["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"]', 4.9, 203, 30),
('prod-20', 'Surface Pro 9', 'Microsoft 2-in-1 laptop tablet', 999.99, 1199.99, 17, 'cat-1', 'Microsoft', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500', '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"]', 4.6, 124, 60),
('prod-21', 'GoPro Hero 12', 'Professional action camera with 5.3K video', 399.99, 499.99, 20, 'cat-1', 'GoPro', 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500', '["https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500"]', 4.7, 189, 80),
('prod-22', 'AirPods Pro 2', 'Professional wireless earbuds with noise cancellation', 249.99, 279.99, 11, 'cat-1', 'Apple', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500', '["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500"]', 4.8, 267, 150),

-- More general products
('prod-23', 'Gaming Headset Pro', 'Professional gaming headset with 7.1 surround sound', 129.99, 159.99, 19, 'cat-1', 'SteelSeries', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', '["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500"]', 4.5, 89, 100),
('prod-24', 'Mechanical Keyboard Pro', 'Professional mechanical keyboard with RGB lighting', 149.99, 179.99, 17, 'cat-1', 'Corsair', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500', '["https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500"]', 4.6, 134, 75),
('prod-25', 'Webcam Pro HD', 'Professional 4K webcam for streaming', 199.99, 249.99, 20, 'cat-1', 'Logitech', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500', '["https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500"]', 4.4, 98, 90),

-- Sports products with "Pro"
('prod-26', 'Tennis Racket Pro', 'Professional tennis racket for advanced players', 299.99, 349.99, 14, 'cat-4', 'Wilson', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', '["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500"]', 4.7, 67, 40),
('prod-27', 'Running Shoes Pro', 'Professional running shoes with advanced cushioning', 179.99, 219.99, 18, 'cat-4', 'Nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"]', 4.6, 145, 120),
('prod-28', 'Golf Set Pro', 'Professional golf club set for serious players', 799.99, 999.99, 20, 'cat-4', 'Callaway', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500', '["https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500"]', 4.8, 43, 25),

-- Fashion items
('prod-29', 'Designer Sunglasses', 'Premium designer sunglasses with UV protection', 299.99, 399.99, 25, 'cat-2', 'Oakley', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', '["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500"]', 4.5, 78, 85),
('prod-30', 'Leather Jacket', 'Premium leather jacket with modern styling', 399.99, 499.99, 20, 'cat-2', 'Hugo Boss', 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=500', '["https://images.unsplash.com/photo-1520975954732-35dd22299614?w=500"]', 4.7, 92, 50),

-- Home & Garden
('prod-31', 'Robot Vacuum Pro', 'Professional robot vacuum with smart mapping', 599.99, 799.99, 25, 'cat-3', 'Roomba', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]', 4.6, 156, 40),
('prod-32', 'Air Purifier Pro', 'Professional air purifier with HEPA filter', 349.99, 429.99, 19, 'cat-3', 'Dyson', 'https://images.unsplash.com/photo-1586953983027-d7508698d4db?w=500', '["https://images.unsplash.com/photo-1586953983027-d7508698d4db?w=500"]', 4.5, 89, 70),

-- More diverse products
('prod-33', 'Smartphone Ultra', 'Latest smartphone with advanced camera system', 899.99, 1099.99, 18, 'cat-1', 'Samsung', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"]', 4.7, 234, 95),
('prod-34', 'Bluetooth Speaker', 'Portable wireless speaker with premium sound', 129.99, 159.99, 19, 'cat-1', 'JBL', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"]', 4.4, 167, 200),
('prod-35', 'Smart Watch', 'Advanced smartwatch with health monitoring', 349.99, 399.99, 13, 'cat-1', 'Apple', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"]', 4.6, 189, 110)
ON CONFLICT (id) DO NOTHING;
