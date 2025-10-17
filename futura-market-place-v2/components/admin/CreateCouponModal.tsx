'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CouponType, CreateCoupon } from '@/app/shared/interface';

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (coupon: CreateCoupon) => Promise<void>;
}

export function CreateCouponModal({ isOpen, onClose, onSave }: CreateCouponModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCoupon>({
    code: '',
    type: CouponType.PERCENTAGE,
    discount: 0,
    eventId: undefined,
    maxUses: 100,
    maxUsesPerUser: 1,
    startDate: new Date(),
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Code must be at least 3 characters';
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.code)) {
      newErrors.code = 'Code can only contain letters, numbers, underscores and hyphens';
    }

    if (formData.type === CouponType.PERCENTAGE) {
      if (formData.discount <= 0 || formData.discount > 100) {
        newErrors.discount = 'Percentage must be between 1 and 100';
      }
    } else if (formData.type === CouponType.FIXED_AMOUNT) {
      if (formData.discount <= 0) {
        newErrors.discount = 'Amount must be greater than 0';
      }
    }

    if (formData.maxUses <= 0) {
      newErrors.maxUses = 'Max uses must be greater than 0';
    }

    if (formData.maxUsesPerUser <= 0) {
      newErrors.maxUsesPerUser = 'Max uses per user must be greater than 0';
    }

    if (new Date(formData.expirationDate) <= new Date(formData.startDate)) {
      newErrors.expirationDate = 'Expiration date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      toast.success('Coupon created successfully!');
      handleClose();
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast.error(error.message || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      type: CouponType.PERCENTAGE,
      discount: 0,
      eventId: undefined,
      maxUses: 100,
      maxUsesPerUser: 1,
      startDate: new Date(),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      description: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-futura-dark border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-futura-teal">Create New Coupon</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium">
              Coupon Code *
            </Label>
            <Input
              id="code"
              value={formData.code}
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
                value={formData.type}
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
                  value={formData.discount}
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
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="100"
                min="1"
              />
              {errors.maxUses && <p className="text-red-400 text-xs">{errors.maxUses}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsesPerUser" className="text-sm font-medium">
                Max Uses Per User *
              </Label>
              <Input
                id="maxUsesPerUser"
                type="number"
                value={formData.maxUsesPerUser}
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
                value={new Date(formData.startDate).toISOString().slice(0, 16)}
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
                value={new Date(formData.expirationDate).toISOString().slice(0, 16)}
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
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-white/10 bg-white/5 text-futura-teal focus:ring-futura-teal"
            />
            <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
              Activate coupon immediately
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
              {loading ? 'Creating...' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
