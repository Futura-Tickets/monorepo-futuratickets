'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// TAILWIND
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// COMPONENTS
import { Header } from '@/components/header';

// SERVICES
import { getOrderById } from '@/app/shared/services/services';

// ICONS
import { CheckCircle, Ticket, AlertCircle } from 'lucide-react';

// NUEVO COMPONENTE
import OrderDetailsDisplay from '../../components/order-details-display';
import { useCart } from '@/contexts/cart-context';

export default function ResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchOrderDetails = async () => {
    const paymentIntentId = searchParams.get('paymentIntentId');

    try {
      setIsLoading(true);
      setError(null);

      if (!paymentIntentId) {
        setError('Payment ID not found');
        toast({
          title: 'Incomplete Information',
          description: 'Could not find order information',
          variant: 'destructive',
        });
        return;
      }

      const orderData = await getOrderById(paymentIntentId);
      setOrderDetails(orderData);
      clearCart(); 
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Error loading order data');
      toast({
        title: 'Error',
        description: 'Could not load your purchase details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not available';

    try {
      const date = new Date(dateString);

      // Verify if the date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date received:', dateString);
        return 'Date not available';
      }

      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };

      return date.toLocaleDateString('en-US', options); // Changed to en-US
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      {/* Header con menú desplegable */}
      <Header />

      <div className='container mx-auto px-4 py-16'>
        {isLoading ? (
          <div className='max-w-lg mx-auto my-12 text-center'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-futura-teal mb-4'></div>
            <p className='text-futura-teal text-lg'>
              Loading your purchase summary...
            </p>
          </div>
        ) : error ? (
          <div className='max-w-lg mx-auto my-12 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-futura-orange/20 mb-4'>
              <AlertCircle className='h-8 w-8 text-futura-orange' />
            </div>
            <p className='text-futura-orange text-lg mb-4'>{error}</p>
            <Button
              onClick={() => router.push('/')}
              className='bg-futura-teal hover:bg-futura-teal/90 text-black'
            >
              Back to home
            </Button>
          </div>
        ) : orderDetails && orderDetails.length > 0 ? (
          <main className='flex items-start justify-center'>
            <div className='w-full max-w-2xl'>
              <div className='text-center mb-10'>
                <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-futura-teal/20 mb-4'>
                  <CheckCircle className='h-8 w-8 text-futura-teal' />
                </div>
                <h1 className='text-3xl font-bold mb-2'>
                  Purchase successful!
                </h1>
                <p className='text-gray-400'>
                  Your order has been confirmed and your tickets are ready
                </p>
              </div>
              <OrderDetailsDisplay
                orderDetails={orderDetails}
                formatDate={formatDate}
                router={router}
              />
            </div>
          </main>
        ) : (
          <div className='max-w-lg mx-auto my-12 text-center'>
            <p className='text-futura-orange text-lg mb-4'>
              Could not find purchase information
            </p>
            <Button
              onClick={() => router.push('/')}
              className='bg-futura-teal hover:bg-futura-teal/90 text-black'
            >
              Back to home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}