'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateEvent } from '@/app/shared/services/services';
import { EventAPI } from '@/app/shared/interface';
import { toast } from 'sonner';

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  event: EventAPI | null;
}

export function EditEventModal({ open, onOpenChange, onSuccess, event }: EditEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    capacity: 0,
    commission: 0,
    // Location
    venue: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    lat: 0,
    lon: 0,
    // DateTime
    launchDate: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    // Tickets
    maxQuantity: 10,
    // Resale
    resaleEnabled: false,
    resaleMaxPrice: 0,
    // Other
    status: 'CREATED',
    isBlockchain: false,
  });

  // Load event data when modal opens
  useEffect(() => {
    if (event && open) {
      // Format dates for input fields
      const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toTimeString().slice(0, 5);
      };

      setFormData({
        name: event.name || '',
        description: event.description || '',
        image: event.image || '',
        capacity: event.capacity || 0,
        commission: event.commission || 0,
        // Location
        venue: event.location?.venue || '',
        address: event.location?.address || '',
        city: event.location?.city || '',
        country: event.location?.country || '',
        postalCode: event.location?.postalCode || '',
        lat: event.location?.lat || 0,
        lon: event.location?.lon || 0,
        // DateTime
        launchDate: formatDate(event.dateTime?.launchDate),
        startDate: formatDate(event.dateTime?.startDate),
        endDate: formatDate(event.dateTime?.endDate),
        startTime: formatTime(event.dateTime?.startTime),
        endTime: formatTime(event.dateTime?.endTime),
        // Tickets
        maxQuantity: event.maxQuantity || 10,
        // Resale
        resaleEnabled: event.resale?.isActive || false,
        resaleMaxPrice: event.resale?.maxPrice || 0,
        // Other
        status: event.status || 'CREATED',
        isBlockchain: event.isBlockchain || false,
      });
    }
  }, [event, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setLoading(true);
    setError('');

    try {
      // Construir el objeto del evento según el formato de la API
      const eventData = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        capacity: Number(formData.capacity),
        commission: Number(formData.commission),
        location: {
          venue: formData.venue,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode,
          lat: Number(formData.lat),
          lon: Number(formData.lon),
        },
        dateTime: {
          launchDate: new Date(formData.launchDate),
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          startTime: new Date(`1970-01-01T${formData.startTime}`),
          endTime: new Date(`1970-01-01T${formData.endTime}`),
        },
        maxQuantity: Number(formData.maxQuantity),
        resale: {
          isActive: formData.resaleEnabled,
          maxPrice: formData.resaleEnabled ? Number(formData.resaleMaxPrice) : 0,
        },
        status: formData.status,
        isBlockchain: formData.isBlockchain,
      };

      await updateEvent(event._id, eventData);

      toast.success('Event updated successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      const errorMsg = err.message || 'Error updating event';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-futura-dark text-white border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl text-futura-teal">Edit Event</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update event details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-futura-teal">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="image">Image URL *</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  required
                  placeholder="event-image.jpg"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                rows={3}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="commission">Commission (%) *</Label>
                <Input
                  id="commission"
                  type="number"
                  step="0.01"
                  value={formData.commission}
                  onChange={(e) => handleInputChange('commission', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-futura-teal">Location</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.000001"
                  value={formData.lat}
                  onChange={(e) => handleInputChange('lat', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="lon">Longitude</Label>
                <Input
                  id="lon"
                  type="number"
                  step="0.000001"
                  value={formData.lon}
                  onChange={(e) => handleInputChange('lon', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-futura-teal">Date & Time</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="launchDate">Launch Date *</Label>
                <Input
                  id="launchDate"
                  type="date"
                  value={formData.launchDate}
                  onChange={(e) => handleInputChange('launchDate', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          {/* Tickets */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-futura-teal">Tickets</h3>

            <div>
              <Label htmlFor="maxQuantity">Max Tickets per Order *</Label>
              <Input
                id="maxQuantity"
                type="number"
                value={formData.maxQuantity}
                onChange={(e) => handleInputChange('maxQuantity', e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
              Note: Ticket types cannot be edited here. Manage ticket inventory through the dedicated ticket management section.
            </div>
          </div>

          {/* Resale */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-futura-teal">Resale Settings</h3>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="resaleEnabled"
                checked={formData.resaleEnabled}
                onChange={(e) => handleInputChange('resaleEnabled', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="resaleEnabled">Enable Resale</Label>
            </div>

            {formData.resaleEnabled && (
              <div>
                <Label htmlFor="resaleMaxPrice">Max Resale Price (€) *</Label>
                <Input
                  id="resaleMaxPrice"
                  type="number"
                  step="0.01"
                  value={formData.resaleMaxPrice}
                  onChange={(e) => handleInputChange('resaleMaxPrice', e.target.value)}
                  required={formData.resaleEnabled}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-futura-teal">Status & Configuration</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Event Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOLD">Hold</SelectItem>
                    <SelectItem value="CREATED">Created</SelectItem>
                    <SelectItem value="LAUNCHED">Launched</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isBlockchain"
                    checked={formData.isBlockchain}
                    onChange={(e) => handleInputChange('isBlockchain', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isBlockchain">Blockchain Enabled</Label>
                </div>
              </div>
            </div>
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
              {loading ? 'Updating...' : 'Update Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
