
-- Create a table for user wishlists
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Add Row Level Security (RLS) to ensure users can only manage their own wishlist
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own wishlist items
CREATE POLICY "Users can view their own wishlist" 
  ON public.wishlists 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own wishlist items
CREATE POLICY "Users can add to their own wishlist" 
  ON public.wishlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own wishlist items
CREATE POLICY "Users can remove from their own wishlist" 
  ON public.wishlists 
  FOR DELETE 
  USING (auth.uid() = user_id);
