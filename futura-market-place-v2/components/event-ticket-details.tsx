import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User } from 'lucide-react';
import type { OrderPayload, OrderItem } from '@/app/shared/interface';

interface EventTicketDetailsProps {
  order: OrderPayload;
  orderIndex: number;
}

export default function EventTicketDetails({ order, orderIndex }: EventTicketDetailsProps) {
  return (
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
              {new Date(order.event.dateTime.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
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
              Promotor:{' '}
              {typeof order.event.promoter === 'object' && order.event.promoter.name
                ? order.event.promoter.name
                : 'Promotor no especificado'}
            </span>
          </div>
        )}
      </div>

      <h5 className='font-medium text-gray-300 mb-3'>
        Tickets para este evento:
      </h5>
      {order.items?.map((item: OrderItem, itemIndex: number) => {
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
                    {item.type || 'Entrada General'}
                  </h4>
                  <div className='flex items-center gap-2 text-sm mt-1'>
                    <Badge variant='outline'>{`x${quantity}`}</Badge>
                    <span className='text-gray-400'>
                      {quantity > 1 ? 'entradas' : 'entrada'}
                    </span>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-sm text-gray-400'>
                    Precio por unidad
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
  );
}
