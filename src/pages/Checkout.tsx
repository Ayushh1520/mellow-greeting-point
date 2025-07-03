
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Tables } from '@/integrations/supabase/types';

type CartItem = Tables<'cart'> & {
  products: Tables<'products'>;
};

type Address = Tables<'addresses'>;

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    await Promise.all([fetchCartItems(), fetchAddresses()]);
    setLoading(false);
  };

  const fetchCartItems = async () => {
    const { data, error } = await supabase
      .from('cart')
      .select(`
        *,
        products (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cart:', error);
    } else {
      setCartItems(data || []);
    }
  };

  const fetchAddresses = async () => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
    } else {
      setAddresses(data || []);
      if (data && data.length > 0) {
        const defaultAddress = data.find(addr => addr.is_default) || data[0];
        setSelectedAddress(defaultAddress.id);
      }
    }
  };

  const addAddress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        ...newAddress,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
    } else {
      setAddresses([...addresses, data]);
      setSelectedAddress(data.id);
      setNewAddress({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
      });
      toast({
        title: "Success",
        description: "Address added successfully",
      });
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast({
        title: "Error",
        description: "Please select a delivery address",
        variant: "destructive",
      });
      return;
    }

    setPlacing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const totalAmount = cartItems.reduce((sum, item) => {
      const price = item.products.original_price 
        ? item.products.original_price - (item.products.original_price * (item.products.discount_percentage || 0) / 100)
        : item.products.price;
      return sum + (price * item.quantity);
    }, 0);

    const orderNumber = `ORD-${Date.now()}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        total_amount: totalAmount,
        shipping_address_id: selectedAddress,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
      setPlacing(false);
      return;
    }

    // Add order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.original_price 
        ? item.products.original_price - (item.products.original_price * (item.products.discount_percentage || 0) / 100)
        : item.products.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error adding order items:', itemsError);
    }

    // Clear cart
    const { error: cartError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id);

    if (cartError) {
      console.error('Error clearing cart:', cartError);
    }

    toast({
      title: "Order placed successfully!",
      description: `Order ${orderNumber} has been placed`,
    });

    navigate('/orders');
    setPlacing(false);
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    const price = item.products.original_price 
      ? item.products.original_price - (item.products.original_price * (item.products.discount_percentage || 0) / 100)
      : item.products.price;
    return sum + (price * item.quantity);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id={address.id}
                      name="address"
                      value={address.id}
                      checked={selectedAddress === address.id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="mt-1"
                    />
                    <label htmlFor={address.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{address.full_name}</div>
                      <div className="text-sm text-gray-600">
                        {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}
                        {address.city}, {address.state} - {address.postal_code}
                      </div>
                      <div className="text-sm text-gray-600">{address.phone}</div>
                    </label>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Add New Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Full Name"
                      value={newAddress.full_name}
                      onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})}
                    />
                    <Input
                      placeholder="Phone"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                    />
                    <Input
                      placeholder="Address Line 1"
                      value={newAddress.address_line1}
                      onChange={(e) => setNewAddress({...newAddress, address_line1: e.target.value})}
                      className="md:col-span-2"
                    />
                    <Input
                      placeholder="Address Line 2 (Optional)"
                      value={newAddress.address_line2}
                      onChange={(e) => setNewAddress({...newAddress, address_line2: e.target.value})}
                      className="md:col-span-2"
                    />
                    <Input
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    />
                    <Input
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    />
                    <Input
                      placeholder="Postal Code"
                      value={newAddress.postal_code}
                      onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={addAddress} 
                    variant="outline" 
                    className="mt-4"
                    disabled={!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.postal_code}
                  >
                    Add Address
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const price = item.products.original_price 
                      ? item.products.original_price - (item.products.original_price * (item.products.discount_percentage || 0) / 100)
                      : item.products.price;
                    
                    return (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={item.products.image_url || '/placeholder.svg'}
                          alt={item.products.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.products.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{(price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={placeOrder}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  size="lg"
                  disabled={placing || !selectedAddress}
                >
                  {placing ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
