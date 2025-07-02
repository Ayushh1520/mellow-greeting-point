
import React, { useEffect, useState } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchCartItems();
    }
  }, [isOpen]);

  const fetchCartItems = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('cart')
      .select(`
        id,
        quantity,
        product:products(id, name, price, image_url)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart:', error);
    } else {
      setCartItems(data as CartItem[] || []);
    }
    setLoading(false);
  };

  const updateQuantity = async (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const { error } = await supabase
      .from('cart')
      .update({ quantity: newQuantity })
      .eq('id', cartId);

    if (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } else {
      fetchCartItems();
    }
  };

  const removeItem = async (cartId: string) => {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartId);

    if (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } else {
      fetchCartItems();
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex space-x-3 animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Button onClick={onClose}>Continue Shopping</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex space-x-3 border-b pb-4">
                    <img
                      src={item.product.image_url || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{item.product.price.toLocaleString()}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total: ₹{getTotalPrice().toLocaleString()}</span>
              </div>
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
