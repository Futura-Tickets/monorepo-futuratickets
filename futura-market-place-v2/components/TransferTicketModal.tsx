'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Send } from 'lucide-react';
import { transferSale } from '@/app/shared/services/services';
import type { TransferToTicket } from '@/app/shared/interface';

export default function TransferTicketModal({ isOpen, onClose, order, saleId, onTransferSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TransferToTicket>({
    name: '',
    lastName: '',
    birthdate: '',
    email: ''
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return formData.name && formData.lastName && formData.email;
  };

  const handleTransfer = async () => {
    setIsLoading(true);
    try {
      await transferSale(saleId, formData);
      
      if (onTransferSuccess) {
        onTransferSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error transferring ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1D2B2A] border-white/10 text-white p-6 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Transfer Ticket</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-300 mb-4">
            Enter the details of the person you want to transfer this ticket to for the event: 
            <span className="font-medium text-futura-teal block mt-1">{order.event?.name}</span>
          </p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">First Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/10"
                  placeholder="First Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/10"
                  placeholder="Last Name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input 
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-white/5 border-white/10"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Date of Birth</Label>
              <Input 
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthdate}
                onChange={handleInputChange}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={handleInputChange}
                className="bg-white/5 border-white/10"
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-white/10 hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleTransfer}
            disabled={!isFormValid() || isLoading}
            className="bg-futura-teal hover:bg-futura-teal/90 gap-2"
          >
            {isLoading ? 'Processing...' : (
              <>
                <Send className="h-4 w-4" /> 
                Transfer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}