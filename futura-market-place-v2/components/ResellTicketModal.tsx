'use client';
import { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';

// COMPONENTS
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';

// SERVICES
import { resaleSale } from '@/app/shared/services/services';

export default function ResellTicketModal({ isOpen, onClose, order, saleId, onResaleSuccess }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resalePrice, setResalePrice] = useState<number>(0);


  useEffect(() => {
    setResalePrice(order.price);
  }, [order.price]);

  const handleResale = async () => {
    setIsLoading(true);
    try {
      
      console.log('Resale successful:', saleId, resalePrice);
      await resaleSale(saleId, resalePrice);
      
      if (onResaleSuccess) {
        onResaleSuccess();
      }

      toast({
        title: "Ticket listed for resale!",
        description: `Your ticket is now available for resale at €${resalePrice}`,
      });

      onClose();
    } catch (error) {
      console.error('Error listing ticket for resale:', error);
      toast({
        title: "Error listing for resale",
        description: "The operation could not be completed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1D2B2A] border-white/10 text-white p-6 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Resell Ticket</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-300 mb-4">
            Set the price at which you want to resell your ticket for the event: 
            <span className="font-medium text-futura-teal block mt-1">{order.event?.name}</span>
          </p>
          
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="resalePrice">Resale Price</Label>
                <span className="text-futura-teal font-semibold">€{resalePrice}</span>
              </div>
              
              <div className="py-4">
                <Slider 
                  id="resalePrice"
                  min={order.price}
                  max={order.event.resale.maxPrice}
                  step={1}
                  value={[resalePrice]}
                  onValueChange={(values) => setResalePrice(values[0])}
                  className="py-4 [&>.relative]:bg-white/10 [&>div>div]:bg-futura-teal"
                />
                
                <div className="flex justify-between text-xs text-gray-400 pt-2">
                  <span>Original price: €{order.price}</span>
                  <span>Maximum price: €{order.event.resale.maxPrice}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between text-sm mb-2">
                <span>Original price:</span>
                <span>€{order.price}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Your resale price:</span>
                <span className="text-futura-teal font-semibold">€{resalePrice}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/10 mt-2">
                <span>Estimated profit:</span>
                <span className="text-futura-teal font-semibold">€{(resalePrice - order.price).toFixed(2)}</span>
              </div>
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
            onClick={handleResale}
            disabled={isLoading || resalePrice <= 0}
            className="bg-futura-teal hover:bg-futura-teal/90 gap-2"
          >
            {isLoading ? 'Processing...' : (
              <>
                <Tag className="h-4 w-4" /> 
                List for Resale
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}