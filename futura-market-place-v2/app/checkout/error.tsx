'use client';

import { useEffect } from 'react';
import { AlertCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Checkout error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-futura-dark to-black p-4">
      <Card className="bg-white/5 border-white/10 max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-6 w-6" />
            Checkout Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-400">
            There was an error processing your checkout. Your cart items are safe.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={reset}
              className="flex-1 bg-futura-teal hover:bg-futura-teal/90"
            >
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/cart'}
              variant="outline"
              className="flex-1 border-white/10 hover:bg-white/5 gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              View Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
