'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/cart-context';
import CouponInput from './coupon';

export function Summary({ onCouponApplied }: any) {

  const { items, totalPrice, totalItems } = useCart();
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);

  const calculateTotalCommission = () => {
    return items.reduce((total, item) => {
      const itemCommission = item.commission || 0;
      return total + (item.price * item.quantity * itemCommission) / 100;
    }, 0);
  };

  const subtotal = totalPrice;
  
  const discountAmount = appliedCoupon  ? Math.ceil((subtotal) * appliedCoupon.discount / 100 * 100) / 100 : 0;
  
  const subtotalWithDiscount = subtotal - discountAmount;
  
  const calculateServiceFee = () => {
    return Math.ceil(((subtotalWithDiscount + calculateTotalCommission()) * 1.25 / 100 + 0.25 + calculateTotalCommission()) * 100) / 100;
  };

  const finalTotal = Math.ceil((subtotalWithDiscount + calculateServiceFee()) * 100) / 100;

  const handleCouponApplied = (coupon: any) => {
    setAppliedCoupon(coupon);
    onCouponApplied(coupon);
  };

  return (
    <Card className='bg-white/5 border-white/10 sticky top-24'>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='max-h-80 overflow-y-auto space-y-4 pr-2'>
          {items.map((item) => (
            <div key={item.id} className='flex gap-4 pb-4 border-b border-white/10'>
              <div className='relative w-16 h-16 flex-shrink-0'>
                <Image
                  src={item.eventImage || '/placeholder.svg'}
                  alt={item.eventTitle}
                  fill
                  className='object-cover rounded'
                />
              </div>
              <div className='flex-1'>
                <h4 className='font-medium text-sm'>{item.eventTitle}</h4>
                <div className='flex items-center gap-1 text-xs text-gray-400'>
                  <Calendar className='h-3 w-3 text-futura-teal' />
                  <span>{item.eventDate}</span>
                </div>
                <div className='flex items-center gap-1 text-xs text-gray-400'>
                  <MapPin className='h-3 w-3 text-futura-teal' />
                  <span>{item.eventVenue}</span>
                </div>
                <div className='flex justify-between items-center mt-1'>
                  <span className='text-xs'>
                    {item.ticketType.charAt(0).toUpperCase() + item.ticketType.slice(1)}{' '}
                    {item.resale && <Badge className="bg-amber-600/20 text-amber-400 ml-1 text-[10px]">Reventa</Badge>}
                    × {item.quantity}
                  </span>
                  <span className='text-sm'>{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='pt-4 space-y-2'>
          <div className='flex justify-between'>
            <span className='text-gray-400'>
              Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
            <span>{subtotal.toFixed(2)}€</span>
          </div>
          
          {appliedCoupon && (
            <div className='flex justify-between text-futura-teal'>
              <span>Discount ({appliedCoupon.discount}%)</span>
              <span>-{discountAmount.toFixed(2)} €</span>
            </div>
          )}
          
          <div className='flex justify-between'>
            <span className='text-gray-400'>Service Fee</span>
            <span>
              {calculateServiceFee().toFixed(2)} €
            </span>
          </div>
          
          <div className='flex justify-between font-semibold'>
            <span>Total</span>
            <span className='text-futura-orange'>
              {finalTotal.toFixed(2)} €
            </span>
          </div>
          
          <CouponInput onCouponApplied={handleCouponApplied} />
        </div>
      </CardContent>
    </Card>
  );
}