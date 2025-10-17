'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updatePromoter } from '@/app/shared/services/services';
import { toast } from 'sonner';

interface Promoter {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  createdAt?: string;
}

interface EditPromoterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  promoter: Promoter | null;
}

export function EditPromoterModal({ open, onOpenChange, onSuccess, promoter }: EditPromoterModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    description: '',
  });

  // Load promoter data when modal opens
  useEffect(() => {
    if (promoter && open) {
      setFormData({
        name: promoter.name || '',
        email: promoter.email || '',
        phone: promoter.phone || '',
        website: promoter.website || '',
        description: promoter.description || '',
      });
    }
  }, [promoter, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name) {
      setError('Name is required');
      return false;
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoter) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const promoterData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        description: formData.description || undefined,
      };

      await updatePromoter(promoter._id, promoterData);

      toast.success('Promoter updated successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      const errorMsg = err.message || 'Error updating promoter';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!promoter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-futura-dark text-white border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl text-futura-teal">Edit Promoter</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update promoter information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-futura-teal">Account Information</h3>

            <div>
              <Label htmlFor="name">Promoter Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Company or promoter name"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="promoter@example.com"
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Note: Changing email may affect login credentials
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-futura-teal">Contact Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+34 123 456 789"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description about the promoter"
                rows={3}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
            <p className="font-semibold mb-1">Password Changes</p>
            <p>To change the promoter's password, use the password reset functionality or contact support.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-futura-teal hover:bg-futura-teal/90 text-white"
            >
              {loading ? 'Updating...' : 'Update Promoter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
