
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount_percentage INTEGER DEFAULT 0,
  category_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  images TEXT[], -- Array of image URLs
  brand TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create addresses table
CREATE TABLE public.addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart table
CREATE TABLE public.cart (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_address_id UUID REFERENCES public.addresses(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- RLS Policies for products (public read)
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (is_active = true);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for addresses
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for cart
CREATE POLICY "Users can manage own cart" ON public.cart FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for order items
CREATE POLICY "Users can view own order items" ON public.order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample categories
INSERT INTO public.categories (name, description, image_url) VALUES
('Electronics', 'Electronic devices and accessories', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'),
('Fashion', 'Clothing and fashion accessories', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'),
('Home & Kitchen', 'Home appliances and kitchen essentials', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('Books', 'Books and educational materials', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('Sports', 'Sports equipment and fitness gear', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400');

-- Insert sample products
INSERT INTO public.products (name, description, price, original_price, discount_percentage, category_id, image_url, brand, rating, review_count, stock_quantity) 
SELECT 
  'Smartphone Pro Max',
  'Latest smartphone with advanced features and excellent camera quality',
  799.99,
  999.99,
  20,
  c.id,
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
  'TechBrand',
  4.5,
  1250,
  50
FROM public.categories c WHERE c.name = 'Electronics';

INSERT INTO public.products (name, description, price, original_price, discount_percentage, category_id, image_url, brand, rating, review_count, stock_quantity) 
SELECT 
  'Wireless Headphones',
  'Premium wireless headphones with noise cancellation',
  199.99,
  249.99,
  20,
  c.id,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
  'AudioTech',
  4.3,
  890,
  75
FROM public.categories c WHERE c.name = 'Electronics';

INSERT INTO public.products (name, description, price, original_price, discount_percentage, category_id, image_url, brand, rating, review_count, stock_quantity) 
SELECT 
  'Cotton T-Shirt',
  'Comfortable cotton t-shirt available in multiple colors',
  29.99,
  39.99,
  25,
  c.id,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
  'FashionHub',
  4.2,
  567,
  120
FROM public.categories c WHERE c.name = 'Fashion';

INSERT INTO public.products (name, description, price, original_price, discount_percentage, category_id, image_url, brand, rating, review_count, stock_quantity) 
SELECT 
  'Coffee Maker Deluxe',
  'Automatic coffee maker with programmable settings',
  149.99,
  199.99,
  25,
  c.id,
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
  'HomeAppliances',
  4.4,
  423,
  30
FROM public.categories c WHERE c.name = 'Home & Kitchen';
