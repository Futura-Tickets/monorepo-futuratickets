import type { OrderPayload } from '@/app/shared/interface';

interface OrderReferenceAndDateProps {
  firstOrder: OrderPayload;
  formatDate: (dateString: string) => string;
}

export default function OrderReferenceAndDate({ firstOrder, formatDate }: OrderReferenceAndDateProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <div>
        <p className='text-sm text-gray-400'>Número de referencia</p>
        <p className='font-medium'>{firstOrder.paymentId}</p>
      </div>
      <div>
        <p className='text-sm text-gray-400'>Fecha de compra</p>
        <p className='font-medium'>
          {firstOrder.createdAt
            ? formatDate(firstOrder.createdAt)
            : 'Fecha no disponible'}
        </p>
      </div>
    </div>
  );
}
