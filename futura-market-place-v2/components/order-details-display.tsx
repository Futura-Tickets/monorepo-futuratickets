'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Clock,
  Ticket,
} from 'lucide-react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { OrderPayload, OrderDetailsDisplayProps } from '@/app/shared/interface';

export default function OrderDetailsDisplay({
  orderDetails,
  formatDate,
  router,
}: OrderDetailsDisplayProps) {
  if (!orderDetails || orderDetails.length === 0) {
    return null;
  }

  const firstOrder = orderDetails[0];

  let subtotalAmount = 0;
  let totalCommissionCalculated = 0;
  let totalItems = 0;

  orderDetails.forEach((order) => {
    totalItems += order.items.length;
    order.items.forEach((item) => {
      const price = parseFloat(String(item.price) || '0');
      const quantity = parseInt(String(item.amount) || '1');
      const commissionPercent = typeof order.event.commission === 'number' ? order.event.commission : 0;

      subtotalAmount += price * quantity;
      totalCommissionCalculated += (price * quantity * commissionPercent) / 100;
    });
  });

  const serviceFee = Math.ceil(((subtotalAmount + totalCommissionCalculated) * 1.25 / 100 + 0.25 + totalCommissionCalculated) * 100) / 100;
  const totalAmount = subtotalAmount + serviceFee;

  return (
    <>
      <Card className='bg-white/5 border-white/10 mb-8'>
        <CardHeader>
          <CardTitle className='flex justify-between items-center'>
            <span>Purchase Summary</span>
            <Badge
              variant='outline'
              className='border-futura-teal text-futura-teal'
            >
              {firstOrder.status === 'SUCCEEDED'
                ? 'Confirmed'
                : firstOrder.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-400'>Order</p>
              <p className='font-medium'>#{firstOrder.paymentId?.slice(-8) || "N/A"}</p>
            </div>
            <div>
              <p className='text-sm text-gray-400'>Purchase Date</p>
              <p className='font-medium'>
                {firstOrder.createdAt
                  ? formatDate(firstOrder.createdAt)
                  : 'Date not available'}
              </p>
            </div>
          </div>

          <div className='border-t border-white/10 pt-4 mt-4'>
            <h3 className='text-lg font-bold mb-3 text-futura-teal'>
              Purchased Events and Tickets
            </h3>
            {orderDetails.map((order, orderIndex) => (
              <div
                key={`order-${orderIndex}`}
                className='mb-8 border-b border-white/10 pb-6 last:border-b-0 last:pb-0'
              >
                <div className='bg-white/5 rounded-lg p-4 mb-4'>
                  <h4 className='font-bold text-lg mb-2'>
                    {order.event.name}
                  </h4>
                  {order.event.dateTime?.startDate && (
                    <div className='flex items-center gap-2 mb-1 text-sm'>
                      <Calendar className='h-4 w-4 text-gray-400' />
                      <span>
                        {new Date(order.event.dateTime.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {order.event.location?.venue && (
                    <div className='flex items-center gap-2 mb-1 text-sm'>
                      <MapPin className='h-4 w-4 text-gray-400' />
                      <span>{order.event.location.venue}</span>
                    </div>
                  )}
                  {order.event.promoter && (
                    <div className='flex items-center gap-2 mb-1 text-sm'>
                      <User className='h-4 w-4 text-gray-400' />
                      <span>
                        Promoter:{' '}
                        {typeof order.event.promoter === 'object' && order.event.promoter.name
                          ? order.event.promoter.name
                          : 'Promoter not specified'}
                      </span>
                    </div>
                  )}
                </div>

                <h5 className='font-medium text-gray-300 mb-3'>
                  Tickets for this event:
                </h5>
                {order.items?.map((item, itemIndex: number) => {
                  const quantity = parseInt(String(item.amount) || '1');
                  const unitPrice = parseFloat(String(item.price) || '0');
                  const itemSubtotal = unitPrice * quantity;

                  return (
                    <Card
                      key={`ticket-${orderIndex}-${itemIndex}`}
                      className='bg-futura-dark/50 border-white/5 mb-4'
                    >
                      <CardContent className='p-4'>
                        <div className='flex flex-col md:flex-row justify-between'>
                          <div className='flex-1 mb-3 md:mb-0'>
                            <h4 className='font-bold'>
                              {item.type || 'General Admission'}
                            </h4>
                            <div className='flex items-center gap-2 text-sm mt-1'>
                              <Badge variant='outline'>{`x${quantity}`}</Badge>
                              <span className='text-gray-400'>
                                {quantity > 1 ? 'tickets' : 'ticket'}
                              </span>
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm text-gray-400'>
                              Price per unit
                            </p>
                            <p className='font-bold'>
                              {unitPrice.toFixed(2)} €
                            </p>
                          </div>
                        </div>
                        <div className='bg-white/5 rounded p-3 mt-3 space-y-1'>
                          <div className='flex justify-between text-sm'>
                            <span>Subtotal ({quantity}x)</span>
                            <span>{itemSubtotal.toFixed(2)} €</span>
                          </div>
                          <div className='flex justify-between font-bold pt-1 border-t border-white/10 mt-1'>
                            <span>Total</span>
                            <span className='text-futura-teal'>
                              {itemSubtotal.toFixed(2)} €
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ))}

            <div className='border-t border-white/10 pt-5 mt-6 space-y-2'>
              <h3 className='text-lg font-bold mb-3'>
                Total Purchase Summary
              </h3>
              <div className='bg-white/10 rounded p-4'>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>
                    Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </span>
                  <span>{subtotalAmount.toFixed(2)} €</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>Service Fee</span>
                  <span>{serviceFee.toFixed(2)} €</span>
                </div>
                <div className='flex justify-between font-bold text-lg pt-3 border-t border-white/20 mt-3'>
                  <span>Total</span>
                  <span className='text-futura-teal'>
                    {totalAmount.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </div>

          {firstOrder.contactDetails && (
            <div className='border-t border-white/10 pt-4 mt-4'>
              <h3 className='text-lg font-bold mb-3 text-futura-teal'>
                Buyer Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-400'>Name</p>
                    <p className='font-medium'>
                      {firstOrder.contactDetails.name || 'N/A'}{' '}
                      {firstOrder.contactDetails.lastName || ''}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Mail className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-400'>Email</p>
                    <p className='font-medium'>
                      {firstOrder.contactDetails.email || 'Not available'}
                    </p>
                  </div>
                </div>
                {firstOrder.contactDetails.phone && (
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4 text-gray-400' />
                    <div>
                      <p className='text-sm text-gray-400'>Phone</p>
                      <p className='font-medium'>
                        {firstOrder.contactDetails.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className='border-t border-white/10 pt-4 mt-4'>
            <h3 className='text-lg font-bold mb-3 text-futura-teal'>
              Payment Details
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-400'>
                  Last Updated
                </p>
                <div className='flex items-center gap-1'>
                  <Clock className='h-3 w-3 text-gray-400' />
                  <p className='font-medium'>
                    {formatDate(firstOrder.updatedAt)}
                  </p>
                </div>
              </div>
              <div>
                <p className='text-sm text-gray-400'>Status</p>
                <Badge
                  className={`${firstOrder.status === 'SUCCEEDED'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {firstOrder.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='text-center py-6'>
        <p className='text-gray-400 mb-6'>
          Tickets will be available in your account. You can access them at any time.
        </p>
        <Button
          onClick={() => router.push('/account?tab=tickets')}
          className='bg-futura-teal hover:bg-futura-teal/90 text-black flex items-center gap-2 mx-auto'
          size='lg'
        >
          <Ticket className='h-5 w-5' />
          View my tickets
        </Button>
      </div>
    </>
  );
}
