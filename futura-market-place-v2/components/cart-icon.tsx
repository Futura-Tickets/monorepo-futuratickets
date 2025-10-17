'use client';

import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

export function CartIcon() {
  const { items, totalItems, totalPrice, removeFromCart } = useCart();
  const { toast } = useToast();

  const calculateTotalCommission = () => {
    return items.reduce((total, item) => {
      const itemCommission = item.commission || 0;
      return total + (item.price * item.quantity * itemCommission) / 100;
    }, 0);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <ShoppingCart className='h-5 w-5' />
          {totalItems > 0 && (
            <Badge className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-futura-orange text-white'>
              {totalItems}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-futura-dark border-white/10 p-0 w-[300px]">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Your Cart</h2>
          
          {items.length === 0 ? (
            <div className="py-6 text-center text-gray-400">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between border-b border-white/10 pb-4">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 relative flex-shrink-0">
                      <Image
                        src={item.eventImage || '/placeholder.svg'}
                        alt={item.eventTitle}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.eventTitle}</h4>
                      <p className="text-sm text-gray-400">{item.eventDate}</p>
                      <p className="text-sm text-gray-400">
                        {item.ticketType.charAt(0).toUpperCase() +
                          item.ticketType.slice(1)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="font-semibold text-futura-orange">{(item.price * item.quantity).toFixed(2)}€</span>
                    <button
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => {
                        const itemTitle = item.eventTitle;
                        const itemQuantity = item.quantity;
                        removeFromCart(item.id);
                        toast({
                          variant: "destructive", 
                          title: "Ticket Removed Successfully",
                          description: `${itemTitle} (Quantity: ${itemQuantity}) has been removed from your cart.`,
                          duration: 3000,
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
 
          {items.length > 0 && (
            <>
              <DropdownMenuSeparator className='bg-white/10' />
              <div className='p-2'>
                <div className='flex justify-between items-center mb-2 text-sm'>
                  <span className='text-gray-400'>Service Fee</span>
                  <span>
                      {Math.ceil(((totalPrice+calculateTotalCommission())*1.25/100+0.25+(calculateTotalCommission()))*100)/100}
                    €</span>
                </div>
                
                <div className="space-y-2 border-t border-white/10 pt-4">
                  {/* <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Fee:</span>
                    <span className="font-bold text-futura-orange">
                      {calculateTotalCommission().toFixed(2)}€
                    </span>
                  </div> */}
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-futura-orange">{(totalPrice+(((totalPrice+calculateTotalCommission())*1.25/100+0.25+(calculateTotalCommission()))*100)/100).toFixed(2)}€</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Link href='/cart' className='w-1/2'>
                    <Button
                      variant="outline"
                      className="w-full border-white/10"
                    >
                      View Cart
                    </Button>
                  </Link>
                  <Link href='/checkout' className='w-1/2'>
                    <Button className="w-full bg-futura-teal hover:bg-futura-teal/90">
                      Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
