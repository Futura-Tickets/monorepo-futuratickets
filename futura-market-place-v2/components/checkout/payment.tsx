'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard } from 'lucide-react';

// STRIPE
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

// PROVIDERS
import { useCart } from '@/contexts/cart-context';

// COMPONENTS
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

// INTERFACES
import type { PaymentProps } from '@/app/shared/interface';

const appearance: any = {
  theme: 'night',
  variables: {
    colorPrimary: '#00c8b3', 
    colorBackground: 'rgba(255, 255, 255, 0.05)',
    colorText: '#ffffff',
    colorDanger: '#FE3E01',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, Inter, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    borderRadius: '0.5rem',
    fontSizeBase: '16px',
  },
  rules: {
    '.AccordionItem': {
      marginBottom: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    '.AccordionItem:hover': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '.AccordionItem--selected': {
      borderColor: '#00c8b3',
      boxShadow: '0 0 0 1px rgba(0, 200, 179, 0.5)',
    },
    '.AccordionItem-Header': {
      padding: '14px',
      cursor: 'pointer',
    },
    '.AccordionItem-Content': {
      padding: '0 14px 14px',
    },
    '.Label': {
      fontSize: '14px',
      fontWeight: '400', 
      marginBottom: '8px',
      color: 'rgba(255, 255, 255, 0.7)',
      textTransform: 'none',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, Inter, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      letterSpacing: 'normal',
      fontStyle: 'normal',
    },
    '.Input': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white',
      padding: '10px 12px',
      boxShadow: 'none',
      fontSize: '16px',
      fontFamily: 'inherit',
    },
    '.Input:hover': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '.Input:focus': {
      borderColor: '#00c8b3',
      boxShadow: '0 0 0 1px rgba(0, 200, 179, 0.5)',
    },
    '.Error': {
      color: '#FE3E01',
    },
    '.Tab': {
      padding: '10px 12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      fontFamily: 'inherit',
    },
    '.Tab:hover': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '.Tab--selected': {
      borderColor: '#00c8b3',
      boxShadow: '0 0 0 1px rgba(0, 200, 179, 0.5)',
    }
  },
};

export function Payment({ paymentId, clientSecret, stripePromise }: PaymentProps) {
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <PaymentCard paymentId={paymentId} />
    </Elements>
  );
}



function PaymentCard({ paymentId }: { paymentId: string }) {
  const elements = useElements();
  const stripe = useStripe();
  const { totalPrice } = useCart();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (stripe && elements) {
      setIsLoading(false);
    }
  }, [stripe, elements]);

  const pay = async () => {
    if (!stripe || !elements) {
      console.error('Stripe no inicializado:', { stripe, elements });
      return;
    }

    try {
      setIsRedirecting(true);
      
      const returnUrl = `${window.location.origin}/resume?paymentIntentId=${paymentId}&amount=${totalPrice.toFixed(2)}`;
      
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      if (result.error) {
        setIsRedirecting(false);
        toast({
          title: 'Error en el pago',
          description: result.error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setIsRedirecting(false);
    }
  };

  if (isLoading) {
    return <div>Cargando formulario de pago...</div>;
  }

  return (
    <Card className='bg-white/5 border-white/10 mb-8'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CreditCard className='h-5 w-5 text-futura-teal' />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PaymentElement 
          options={{
            layout: {
              type: 'accordion',
              defaultCollapsed: false,
              radios: true,
              spacedAccordionItems: true,
            },
          }}
        />
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Link href='/cart'>
          <Button variant='outline' className='border-white/10 hover:bg-white/5 gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Back to Cart
          </Button>
        </Link>
        <Button
          onClick={pay}
          disabled={isRedirecting || !stripe || !elements}
          className='bg-futura-teal hover:bg-futura-teal/90'
        >
          {isRedirecting ? 'Processing...' : 'Make Payment'}
        </Button>
      </CardFooter>
    </Card>
  );
}