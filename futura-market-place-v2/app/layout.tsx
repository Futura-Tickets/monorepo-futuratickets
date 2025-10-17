import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/contexts/cart-context';
import { Toaster } from "@/components/ui/sonner";
import { GoogleTagManager } from '@next/third-parties/google'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Footer } from '@/components/footer';
import { AuthProvider } from '@/contexts/auth-context';
import { GlobalProvider } from '@/contexts/global-context';
import { WishlistProvider } from '@/contexts/wishlist-context';
import { ErrorBoundary } from '@/components/error-boundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Futura Tickets - Event Marketplace',
  description: 'Discover and buy tickets for events across Europe',
  generator: 'v0.dev',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang='en' className='dark'>
      <head>
        <GoogleTagManager gtmId="GTM-M3V4JFSK" />
        <link rel='stylesheet' href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' integrity='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=' crossOrigin=''/>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'/>
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
            <GlobalProvider>
              <AuthProvider>
                <WishlistProvider>
                  <CartProvider>
                    {children}
                    <Footer/>
                    <Toaster />
                  </CartProvider>
                </WishlistProvider>
              </AuthProvider>
            </GlobalProvider>
          </GoogleOAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}



