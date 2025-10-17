'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CouponType, Coupon } from '@/app/shared/interface';

interface EditCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  onSave: (id: string, updates: Partial<Coupon>) => Promise<void>;
}

export function EditCouponModal({ isOpen, onClose, coupon, onSave }: EditCouponModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Coupon>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when coupon changes
  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        eventId: coupon.eventId,
        maxUses: coupon.maxUses,
        maxUsesPerUser: coupon.maxUsesPerUser,
        startDate: coupon.startDate,
        expirationDate: coupon.expirationDate,
        isActive: coupon.isActive,
        description: coupon.description
      });
    }
  }, [coupon]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = 'Code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Code must be at least 3 characters';
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.code)) {
      newErrors.code = 'Code can only contain letters, numbers, underscores and hyphens';
    }

    if (formData.type === CouponType.PERCENTAGE) {
      if (!formData.discount || formData.discount <= 0 || formData.discount > 100) {
        newErrors.discount = 'Percentage must be between 1 and 100';
      }
    } else if (formData.type === CouponType.FIXED_AMOUNT) {
      if (!formData.discount || formData.discount <= 0) {
        newErrors.discount = 'Amount must be greater than 0';
      }
    }

    if (!formData.maxUses || formData.maxUses <= 0) {
      newErrors.maxUses = 'Max uses must be greater than 0';
    }

    if (!formData.maxUsesPerUser || formData.maxUsesPerUser <= 0) {
      newErrors.maxUsesPerUser = 'Max uses per user must be greater than 0';
    }

    if (formData.expirationDate && formData.startDate) {
      if (new Date(formData.expirationDate) <= new Date(formData.startDate)) {
        newErrors.expirationDate = 'Expiration date must be after start date';
      }
    }

    // Validate that maxUses is not less than usedCount
    if (coupon && formData.maxUses && formData.maxUses < coupon.usedCount) {
      newErrors.maxUses = `Max uses cannot be less than current usage (${coupon.usedCount})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coupon) return;

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      await onSave(coupon._id, formData);
      toast.success('Coupon updated successfully!');
      handleClose();
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      toast.error(error.message || 'Failed to update coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    onClose();
  };

  if (!coupon) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-futura-dark border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-futura-teal">Edit Coupon</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Usage Stats */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Current Usage</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Times Used</p>
                <p className="text-lg font-bold text-futura-teal">{coupon.usedCount} / {coupon.maxUses}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Usage Percentage</p>
                <p className="text-lg font-bold text-futura-teal">
                  {((coupon.usedCount / coupon.maxUses) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium">
              Coupon Code *
            </Label>
            <Input
              id="code"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="SUMMER2024"
              maxLength={50}
            />
            {errors.code && <p className="text-red-400 text-xs">{errors.code}</p>}
          </div>

          {/* Type and Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Type *
              </Label>
              <Select
                value={formData.type || CouponType.PERCENTAGE}
                onValueChange={(value: CouponType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CouponType.PERCENTAGE}>Percentage</SelectItem>
                  <SelectItem value={CouponType.FIXED_AMOUNT}>Fixed Amount</SelectItem>
                  <SelectItem value={CouponType.TWO_FOR_ONE}>2x1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type !== CouponType.TWO_FOR_ONE && (
              <div className="space-y-2">
                <Label htmlFor="discount" className="text-sm font-medium">
                  {formData.type === CouponType.PERCENTAGE ? 'Discount (%)' : 'Discount (€)'} *
                </Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount || 0}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder={formData.type === CouponType.PERCENTAGE ? '20' : '10.00'}
                  min="0"
                  step={formData.type === CouponType.PERCENTAGE ? '1' : '0.01'}
                  max={formData.type === CouponType.PERCENTAGE ? '100' : undefined}
                />
                {errors.discount && <p className="text-red-400 text-xs">{errors.discount}</p>}
              </div>
            )}
          </div>

          {/* Max Uses */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUses" className="text-sm font-medium">
                Max Total Uses *
              </Label>
              <Input
                id="maxUses"
                type="number"
                value={formData.maxUses || 0}
                onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="100"
                min={coupon.usedCount}
              />
              {errors.maxUses && <p className="text-red-400 text-xs">{errors.maxUses}</p>}
              <p className="text-xs text-gray-400">
                Minimum: {coupon.usedCount} (current usage)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsesPerUser" className="text-sm font-medium">
                Max Uses Per User *
              </Label>
              <Input
                id="maxUsesPerUser"
                type="number"
                value={formData.maxUsesPerUser || 0}
                onChange={(e) => setFormData({ ...formData, maxUsesPerUser: parseInt(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="1"
                min="1"
              />
              {errors.maxUsesPerUser && <p className="text-red-400 text-xs">{errors.maxUsesPerUser}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate" className="text-sm font-medium">
                Expiration Date *
              </Label>
              <Input
                id="expirationDate"
                type="datetime-local"
                value={formData.expirationDate ? new Date(formData.expirationDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, expirationDate: new Date(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
              {errors.expirationDate && <p className="text-red-400 text-xs">{errors.expirationDate}</p>}
            </div>
          </div>

          {/* Event ID (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="eventId" className="text-sm font-medium">
              Event ID (Optional - Leave empty for global coupon)
            </Label>
            <Input
              id="eventId"
              value={formData.eventId || ''}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value || undefined })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Leave empty for global coupon"
            />
            <p className="text-xs text-gray-400">
              Leave empty to make this coupon valid for all events
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white/5 border-white/10 text-white min-h-[80px]"
              placeholder="Summer discount for all events"
              maxLength={200}
            />
            <p className="text-xs text-gray-400 text-right">
              {formData.description?.length || 0}/200
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive ?? false}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-white/10 bg-white/5 text-futura-teal focus:ring-futura-teal"
            />
            <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
              Coupon is active
            </Label>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-futura-teal hover:bg-futura-teal/90 text-white"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
