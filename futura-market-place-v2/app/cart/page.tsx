'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// PROVIDERS
import { type CartItem, useCart } from '@/contexts/cart-context';

// COMPONENTS
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

// ICON
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Calendar, MapPin } from 'lucide-react';

// CONSTANTS
import { GLOBAL_MAX_TICKETS } from '../shared/constants';

const calculateTotalCommission = (items: CartItem[] = []) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity * item.commission) / 100;
  }, 0);
};

// Primero, añade esta función auxiliar
const getTotalTicketsForEvent = (items: CartItem[], eventId: string) => {
  return items
    .filter(item => item.eventId === eventId)
    .reduce((total, item) => total + item.quantity, 0);
};

const CartPage = () => {
  
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const { toast } = useToast();

  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleRemoveItem = (itemId: string, itemTitle: string) => {
    const itemToRemove = items.find(item => item.id === itemId);
    if (!itemToRemove) return;

    const itemQuantity = itemToRemove.quantity;
    removeFromCart(itemId);
    toast({
      title: 'Item removed',
      description: `${itemTitle} has been removed from your cart.`,
      variant: "destructive", 
      duration: 3000,
    });
  };

  const handleUpdateQuantity = (
    itemId: string,
    newQuantity: number,
    itemTitle: string
  ) => {
    
    const currentItem = items.find(item => item.id === itemId);

    if (!currentItem) return;

    if (newQuantity <= 0) {
      handleRemoveItem(itemId, itemTitle);
      return;
    }

    // Calcula el total de tickets para este evento (excluyendo el item actual)
    const otherTicketsForEvent = getTotalTicketsForEvent(
      items.filter(item => item.id !== itemId),
      currentItem.eventId
    );

    if (otherTicketsForEvent + newQuantity > GLOBAL_MAX_TICKETS) {
      toast({
        title: "Overall Limit Reached",
        description: `Maximum ${GLOBAL_MAX_TICKETS} tickets in total per event`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    updateQuantity(itemId, newQuantity);

    toast({
      title: 'Quantity Updated',
      description: `${itemTitle} quantity updated to ${newQuantity}.`,
      duration: 3000,
    });

  };

  if (items.length === 0) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
        <Header/>
        <div className='container mx-auto px-4 py-16'>
          <div className='max-w-2xl mx-auto mt-8 text-center'>
            <div className='bg-white/5 border border-white/10 rounded-lg p-12 flex flex-col items-center'>
              <ShoppingCart className='h-16 w-16 text-gray-400 mb-4' />
              <h1 className='text-2xl font-bold mb-4'>Your cart is empty</h1>
              <p className='text-gray-400 mb-8'>
                Looks like you haven't added any tickets to your cart yet.
              </p>
              <Link href='/'>
                <Button className='bg-futura-teal hover:bg-futura-teal/90'>
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header/>
      <div className='container mx-auto px-4 py-16'>
        <h1 className='text-3xl font-bold mb-8'>Your Shopping Cart</h1>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-6'>
            {items.map((item) => (
              <Card key={item.id} className='bg-white/5 border-white/10 overflow-hidden'>
                <div className='flex flex-col sm:flex-row'>
                  <div className='relative w-full sm:w-40 h-40'>
                    <Image
                      src={item.eventImage || '/placeholder.svg'}
                      alt={item.eventTitle}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <CardContent className='flex-1 p-4 sm:p-6'>
                    <div className='flex flex-col sm:flex-row sm:justify-between'>
                      <div>
                        <h3 className='font-bold text-lg mb-1'>
                          {item.eventTitle}
                        </h3>
                        <div className='flex items-center gap-2 text-sm text-gray-400 mb-1'>
                          <Calendar className='h-4 w-4 text-futura-teal' />
                          <span>{item.eventDate}</span>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-400 mb-3'>
                          <MapPin className='h-4 w-4 text-futura-teal' />
                          <span>{item.eventVenue}</span>
                        </div>
                        <Badge className='bg-white/10 text-white hover:bg-white/20 mb-4'>
                          {item.ticketType.charAt(0).toUpperCase() +
                            item.ticketType.slice(1)}{' '}
                          Ticket
                        </Badge>
                      </div>
                      <div className='text-right mt-4 sm:mt-0'>
                        <p className='text-futura-orange font-bold'>
                          {item.price}€
                        </p>
                        <div className='flex items-center mt-2 justify-end'>
                          <Button
                            variant='outline'
                            size='icon'
                            className='h-8 w-8 border-white/10 hover:bg-white/5'
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.quantity - 1,
                                item.eventTitle
                              )
                            }
                          >
                            <Minus className='h-3 w-3' />
                          </Button>
                          <span className='mx-3'>{item.quantity}</span>
                          <Button
                            variant='outline'
                            size='icon'
                            className='h-8 w-8 border-white/10 hover:bg-white/5'
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.eventTitle
                              )
                            }
                            disabled={getTotalTicketsForEvent(items, item.eventId) >= 3}
                          >
                            <Plus className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className='flex justify-between items-center mt-4 pt-4 border-t border-white/10'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-gray-400 hover:text-white gap-2'
                        onClick={() => handleRemoveItem(item.id, item.eventTitle)}
                      >
                        <Trash2 className='h-4 w-4' /> Remove
                      </Button>
                      <div className='text-right'>
                        {/* <p className='font-bold'>
                          Subtotal: {(item.price * item.quantity).toFixed(2)}€
                        </p>
                        <p className='text-sm text-gray-400'>
                          Fee:{' '}
                          {((item.price * item.quantity * item.commission) / 100).toFixed(2)}€
                        </p> */}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          <div className='lg:col-span-1'>
            <Card className='bg-white/5 border-white/10 sticky top-24'>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>
                    Base Price ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
                
                {/* Lista de elementos individuales con sus comisiones */}
                {items.map((item) => (
                  <div key={item.id} className='border-t border-white/5 pt-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-400'>
                        {item.eventTitle} ({item.ticketType}) x {item.quantity}
                      </span>
                      <span>{(item.price * item.quantity).toFixed(2)}€</span>
                    </div>
                  </div>
                ))}
                
                <div className='flex justify-between'>
                    <span className='text-gray-400'>Service Fee</span>
                    <span>
                      {Math.ceil(((totalPrice + calculateTotalCommission(items)) * 1.25/100 + 0.25  + (calculateTotalCommission(items))) * 100) / 100}
                     €</span>
                  </div>

                <div className='flex justify-between font-semibold'>
                  <span>Total</span>
                  <span className='text-futura-orange'>
                    {' '}
                    {Math.ceil(
                      (totalPrice +
                      calculateTotalCommission(items) +
                      ((totalPrice+calculateTotalCommission(items))*1.25/100+0.25)) * 100
                    )/100}{' '}
                    €
                  </span>
                </div>
              </CardContent>
              <CardFooter className='flex flex-col gap-4'>
                <Link href='/checkout' className='w-full'>
                  <Button className='w-full bg-futura-teal hover:bg-futura-teal/90 gap-2'>
                    Proceed to Checkout
                    <ArrowRight className='h-4 w-4' />
                  </Button>
                </Link>
                <Link href='/' className='w-full'>
                  <Button
                    variant='outline'
                    className='w-full border-white/10 hover:bg-white/5'
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
