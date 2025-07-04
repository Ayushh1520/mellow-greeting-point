
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type Wishlist = Tables<'wishlists'>;

interface WishlistItem extends Wishlist {
  products: Product;
}

const Wishlist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchWishlist();
  }, []);

  const checkAuthAndFetchWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    await fetchWishlist();
    setLoading(false);
  };

  const fetchWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive",
      });
    } else {
      setWishlistItems(data || []);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    } else {
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
      });
    }
  };

  const moveToCart = async (product: Product) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Add to cart
    const { error: cartError } = await supabase
      .from('cart')
      .upsert({
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
      });

    if (cartError) {
      console.error('Error adding to cart:', cartError);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
      return;
    }

    // Remove from wishlist
    await removeFromWishlist(product.id);
    
    toast({
      title: "Moved to cart",
      description: `${product.name} has been moved to your cart`,
    });
  };

  const getDiscountedPrice = (product: Product) => {
    return product.original_price 
      ? product.original_price - (product.original_price * (product.discount_percentage || 0) / 100)
      : product.price;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <span className="text-gray-500">({wishlistItems.length} items)</span>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 mb-6">
                Save items you love to buy them later
              </p>
              <Button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600">
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={item.products.image_url || '/placeholder.svg'}
                    alt={item.products.name}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => navigate(`/product/${item.products.id}`)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 p-2 h-8 w-8 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                    onClick={() => removeFromWishlist(item.products.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <h3 
                    className="font-semibold text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigate(`/product/${item.products.id}`)}
                  >
                    {item.products.name}
                  </h3>
                  
                  <div className="flex items-center space-x-1 mb-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium ml-1">
                        {item.products.rating || 0}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({item.products.review_count || 0})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{getDiscountedPrice(item.products)?.toLocaleString()}
                    </span>
                    {item.products.original_price && item.products.original_price !== item.products.price && (
                      <span className="text-sm line-through text-gray-500">
                        ₹{item.products.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => moveToCart(item.products)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Move to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
