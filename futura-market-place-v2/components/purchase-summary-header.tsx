import { CardTitle, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OrderPayload } from '@/app/shared/interface';

interface PurchaseSummaryHeaderProps {
  firstOrder: OrderPayload;
}

export default function PurchaseSummaryHeader({ firstOrder }: PurchaseSummaryHeaderProps) {
  return (
    <CardHeader>
      <CardTitle className='flex justify-between items-center'>
        <span>Resumen de la compra</span>
        <Badge
          variant='outline'
          className='border-futura-teal text-futura-teal'
        >
          {firstOrder.status === 'SUCCEEDED'
            ? 'Confirmado'
            : firstOrder.status}
        </Badge>
      </CardTitle>
    </CardHeader>
  );
}
