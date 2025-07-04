
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Address = Tables<'addresses'>;

interface AddressFormProps {
  address?: Address;
  onSave: () => void;
  onCancel: () => void;
}

const AddressForm = ({ address, onSave, onCancel }: AddressFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: address?.full_name || '',
    phone: address?.phone || '',
    address_line1: address?.address_line1 || '',
    address_line2: address?.address_line2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postal_code: address?.postal_code || '',
    country: address?.country || 'India',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      if (address) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update(formData)
          .eq('id', address.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Address updated successfully",
        });
      } else {
        // Create new address
        const { error } = await supabase
          .from('addresses')
          .insert({
            ...formData,
            user_id: user.id,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Address added successfully",
        });
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{address ? 'Edit Address' : 'Add New Address'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
            <Input
              value={formData.address_line1}
              onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
              required
              placeholder="House/Flat No., Building Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address Line 2</label>
            <Input
              value={formData.address_line2}
              onChange={(e) => setFormData({...formData, address_line2: e.target.value})}
              placeholder="Area, Landmark (Optional)"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                required
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State *</label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                required
                placeholder="Enter state"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code *</label>
              <Input
                value={formData.postal_code}
                onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                required
                placeholder="Enter postal code"
              />
            </div>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Address'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddressForm;
