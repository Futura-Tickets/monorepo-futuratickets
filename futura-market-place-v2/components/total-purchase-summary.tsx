interface TotalPurchaseSummaryProps {
  totalItems: number;
  subtotalAmount: number;
  serviceFee: number;
  totalAmount: number;
}

export default function TotalPurchaseSummary({ totalItems, subtotalAmount, serviceFee, totalAmount }: TotalPurchaseSummaryProps) {
  return (
    <div className='border-t border-white/10 pt-5 mt-6 space-y-2'>
      <h3 className='text-lg font-bold mb-3'>
        Resumen total de compra
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
  );
}
