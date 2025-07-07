import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AddressForm from '@/components/AddressForm';
import { User, Edit, Save, X, Plus, MapPin, Gift, Zap, Clock, Crown, Star, Sparkles } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Address = Tables<'addresses'>;

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { subscribed, subscriptionTier, subscriptionEnd, loading: subscriptionLoading, checkSubscription, createCheckoutSession, manageSubscription } = useSubscription();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    checkAuthAndFetchData();
    
    // Check for payment success/cancel params
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated. It may take a few moments to update.",
      });
      // Refresh subscription status
      setTimeout(() => {
        checkSubscription();
      }, 2000);
    } else if (searchParams.get('canceled') === 'true') {
      toast({
        title: "Payment Canceled",
        description: "Your subscription payment was canceled.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const checkAuthAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    await Promise.all([fetchProfile(), fetchAddresses()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
      });
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
    }
  };

  const updateProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...formData,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setEditing(false);
      fetchProfile();
    }
  };

  const deleteAddress = async (addressId: string) => {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
      fetchAddresses();
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // First, unset all default addresses
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);

    // Then set the selected address as default
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId);

    if (error) {
      console.error('Error setting default address:', error);
      toast({
        title: "Error",
        description: "Failed to set default address",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Default address updated",
      });
      fetchAddresses();
    }
  };

  const handleAddressSave = () => {
    fetchAddresses();
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleAddressCancel = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleSubscribe = async (tier: string) => {
    try {
      await createCheckoutSession(tier);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      await manageSubscription();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open subscription management",
        variant: "destructive",
      });
    }
  };

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

  if (showAddressForm || editingAddress) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <AddressForm
            address={editingAddress || undefined}
            onSave={handleAddressSave}
            onCancel={handleAddressCancel}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
                {!editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Phone Number"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={updateProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          first_name: profile?.first_name || '',
                          last_name: profile?.last_name || '',
                          phone: profile?.phone || '',
                        });
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Name</label>
                    <p className="text-lg">
                      {profile?.first_name || profile?.last_name 
                        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                        : 'Not provided'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-lg">{profile?.phone || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Status & Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span>Subscription Status</span>
                {subscribed && <Badge className="bg-green-500">{subscriptionTier}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : subscribed ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Active Subscription</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Plan: <strong>{subscriptionTier}</strong>
                    </p>
                    {subscriptionEnd && (
                      <p className="text-sm text-green-700">
                        Next billing: {new Date(subscriptionEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleManageSubscription} className="flex-1">
                      Manage Subscription
                    </Button>
                    <Button onClick={checkSubscription} variant="outline">
                      Refresh Status
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">No active subscription</p>
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      onClick={() => handleSubscribe('Basic')} 
                      variant="outline"
                      className="flex items-center justify-between p-4 h-auto"
                    >
                      <div className="text-left">
                        <div className="font-medium">Basic Plan</div>
                        <div className="text-sm text-gray-500">$9.99/month</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">Essential features</div>
                      </div>
                    </Button>
                    <Button 
                      onClick={() => handleSubscribe('Premium')} 
                      className="flex items-center justify-between p-4 h-auto bg-blue-600 hover:bg-blue-700"
                    >
                      <div className="text-left">
                        <div className="font-medium">Premium Plan</div>
                        <div className="text-sm opacity-90">$19.99/month</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm opacity-90">All premium features</div>
                      </div>
                    </Button>
                    <Button 
                      onClick={() => handleSubscribe('Enterprise')} 
                      variant="outline"
                      className="flex items-center justify-between p-4 h-auto border-purple-200 hover:bg-purple-50"
                    >
                      <div className="text-left">
                        <div className="font-medium text-purple-700">Enterprise Plan</div>
                        <div className="text-sm text-purple-600">$49.99/month</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-purple-600">Advanced features</div>
                      </div>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Premium Features - Enhanced based on subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Premium Features</span>
                {subscribed ? (
                  <Badge className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="secondary">Subscribe to Unlock</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex items-center justify-between p-3 rounded-lg ${subscribed ? 'bg-gradient-to-r from-purple-50 to-pink-50' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <Gift className={`w-5 h-5 ${subscribed ? 'text-purple-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`font-medium ${subscribed ? 'text-purple-800' : 'text-gray-500'}`}>Birthday Surprise</p>
                    <p className={`text-sm ${subscribed ? 'text-purple-600' : 'text-gray-400'}`}>Get special offers on your birthday</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled={!subscribed}>
                  {subscribed ? 'Setup' : 'Locked'}
                </Button>
              </div>
              
              <div className={`flex items-center justify-between p-3 rounded-lg ${subscribed ? 'bg-gradient-to-r from-blue-50 to-cyan-50' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <Clock className={`w-5 h-5 ${subscribed ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`font-medium ${subscribed ? 'text-blue-800' : 'text-gray-500'}`}>Smart Scheduler</p>
                    <p className={`text-sm ${subscribed ? 'text-blue-600' : 'text-gray-400'}`}>Schedule your purchases for optimal timing</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled={!subscribed}>
                  {subscribed ? 'Enable' : 'Locked'}
                </Button>
              </div>
              
              <div className={`flex items-center justify-between p-3 rounded-lg ${subscribed ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <MapPin className={`w-5 h-5 ${subscribed ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`font-medium ${subscribed ? 'text-green-800' : 'text-gray-500'}`}>Geo Deals</p>
                    <p className={`text-sm ${subscribed ? 'text-green-600' : 'text-gray-400'}`}>Location-based exclusive offers</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled={!subscribed}>
                  {subscribed ? 'Activate' : 'Locked'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Shopping Assistant - Enhanced based on subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full p-1 text-white" />
                <span>AI Shopping Assistant</span>
                {subscribed ? (
                  <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">Active</Badge>
                ) : (
                  <Badge variant="secondary">Subscribe to Unlock</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`text-sm ${subscribed ? 'text-gray-600' : 'text-gray-400'}`}>
                Get personalized product recommendations based on your shopping history and preferences.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" disabled={!subscribed}>
                  {subscribed ? 'Style Match' : '🔒 Style Match'}
                </Button>
                <Button variant="outline" size="sm" disabled={!subscribed}>
                  {subscribed ? 'Price Alert' : '🔒 Price Alert'}
                </Button>
                <Button variant="outline" size="sm" disabled={!subscribed}>
                  {subscribed ? 'Trend Forecast' : '🔒 Trend Forecast'}
                </Button>
                <Button variant="outline" size="sm" disabled={!subscribed}>
                  {subscribed ? 'Bulk Deals' : '🔒 Bulk Deals'}
                </Button>
              </div>
              {!subscribed && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    Subscribe to unlock AI-powered shopping assistance and get personalized recommendations!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate('/orders')}
                variant="outline"
                className="w-full justify-start"
              >
                View Order History
              </Button>
              <Button
                onClick={() => navigate('/wishlist')}
                variant="outline"
                className="w-full justify-start"
              >
                My Wishlist
              </Button>
              <Button
                onClick={() => supabase.auth.signOut()}
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Saved Addresses */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Saved Addresses</CardTitle>
                <Button
                  onClick={() => setShowAddressForm(true)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No addresses saved yet</p>
                  <Button onClick={() => setShowAddressForm(true)}>
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{address.full_name}</span>
                            {address.is_default && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}
                            {address.city}, {address.state} - {address.postal_code}
                          </p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingAddress(address)}
                          >
                            Edit
                          </Button>
                          {!address.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDefaultAddress(address.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAddress(address.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
