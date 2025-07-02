
import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const addToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to login to add items to cart",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    const { error } = await supabase
      .from('cart')
      .upsert({
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
      });

    if (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    }
  };

  const discountedPrice = product.original_price 
    ? product.original_price - (product.original_price * (product.discount_percentage || 0) / 100)
    : product.price;

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount_percentage && product.discount_percentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
            {product.discount_percentage}% OFF
          </Badge>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium ml-1">
              {product.rating || 0}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            ({product.review_count || 0})
          </span>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            ₹{discountedPrice?.toLocaleString()}
          </span>
          {product.original_price && product.original_price !== product.price && (
            <span className="text-sm line-through text-gray-500">
              ₹{product.original_price.toLocaleString()}
            </span>
          )}
        </div>

        <Button
          onClick={addToCart}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
