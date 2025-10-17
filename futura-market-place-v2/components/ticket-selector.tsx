'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingCart, Check, X } from 'lucide-react';
import type { Event } from '@/lib/events-data';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import type { Ticket } from '@/app/shared/interface';
import { useCart } from '@/contexts/cart-context';

// INTERFACES
interface TicketSelectorProps {
  event: Event;
  onClose?: () => void;
  compact?: boolean;
}

// CONSTANTS
import { GLOBAL_MAX_TICKETS } from '@/app/shared/constants';

export function TicketSelector({ event, onClose, compact = false }: TicketSelectorProps) {

  const [selectedTicket, setSelectedTicket] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart, getItemCount, isInCart } = useCart();
  const { toast } = useToast();
  const [ticketTypes, setTicketTypesState] = useState<Ticket[]>([]);

  const setTicketTypes = (tickets: Ticket[]): void => {
    setTicketTypesState(tickets);
  };

  useEffect(() => {
    if (event && event.tickets) {
      // Verificar que cada ticket tenga availableTickets
      const validatedTickets = event.tickets.map(ticket => ({
        ...ticket,
        availableTickets: event.availableTickets || 3 // Valor por defecto si no existe
      }));
      setTicketTypes(validatedTickets);
      setSelectedTicket(validatedTickets[0]?.type);
    }
  }, [event]);

  // Reset quantity when ticket type changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedTicket]);

  const getSelectedTicket = () => {;
    return ticketTypes.find(ticket => ticket.type === selectedTicket);
  };

  const getTotalTicketsInCart = () => {
    return ticketTypes.reduce((total, ticket) => {
      return total + getItemCount(event.id, ticket.type);
    }, 0);
  };

  const handleAddToCart = () => {
    addToCart(event, selectedTicket!, quantity);

    toast({
      variant: "success", 
      title: 'Tickets Added Successfully',
      description: `${event.title} (Quantity: ${quantity}) has been added to your cart.`,
      duration: 3000,
    });

    if (onClose) {
      onClose();
    }
  };

  const incrementQuantity = () => {
    
    const totalInCart = getTotalTicketsInCart();

    if (totalInCart + quantity < GLOBAL_MAX_TICKETS) {
      setQuantity(quantity + 1);
    } else {
      toast({
        title: "Overall Limit Reached",
        description: `Maximum ${GLOBAL_MAX_TICKETS} tickets in total per event`,
        variant: "destructive"
      });
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // función para calcular la comisión
  const calculateCommission = (price: number): number => {
    return (price * (event.commission || 0)) / 100;
  };

  const isAtMaxLimit = () => {
    const totalInCart = getTotalTicketsInCart();
    return totalInCart + quantity > GLOBAL_MAX_TICKETS;
  };


  const canIncrementQuantity = () => {
    const totalInCart = getTotalTicketsInCart();
    return (totalInCart + quantity) < GLOBAL_MAX_TICKETS;
  };

  if (compact) {
    return (
      <Card className='bg-white/5 border-white/10 text-white'>
        <CardHeader className='pb-2'>
          <div className="flex justify-between items-center w-full">
            <CardTitle className='text-lg text-futura-teal'>
              Select Tickets
            </CardTitle>
            {onClose && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-futura-teal hover:bg-white/5 p-0" 
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex justify-between items-center'>
            <select
              className='bg-white/5 border border-white/10 rounded-md p-2 text-white w-full'
              value={selectedTicket}
              onChange={(e) => setSelectedTicket(e.target.value)}
            >
              {ticketTypes.map((ticket: Ticket, i: number) => (
                <option key={i} value={ticket.type}>
                  {ticket.type} - {ticket.price}€
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center justify-between'>
            <span>Quantity</span>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='icon'
                onClick={decrementQuantity}
                className='border-white/10 hover:bg-white/5 hover:text-futura-teal h-8 w-8'
              >
                <Minus className='h-3 w-3' />
              </Button>
              <Input
                type='number'
                min='1'
                max={getSelectedTicket()?.availableTickets || 1}
                value={quantity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  const totalInCart = getTotalTicketsInCart();
                  const GLOBAL_MAX_TICKETS = 3;

                  if (value >= 1 && totalInCart + value <= GLOBAL_MAX_TICKETS) {
                    setQuantity(value);
                  }
                }}
                className='w-12 text-center bg-white/5 border-white/10 h-8 `bg-white/5 gap-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
              />
              <Button
                variant='outline'
                size='icon'
                onClick={incrementQuantity}
                disabled={!canIncrementQuantity()}
                className='border-white/10 hover:bg-white/5 hover:text-futura-teal h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <Plus className='h-3 w-3' />
              </Button>
            </div>
          </div>

          <div className='pt-2 border-t border-white/10'>
            {/* <div className='flex justify-between items-center font-bold'>
              <span>Fee:</span>
              {calculateCommission(
                ticketTypes.find((ticket) => ticket.type === selectedTicket)
                  ?.price || 0
              ).toFixed(2)}
              € × {quantity}
            </div> */}
            <div className='flex justify-between items-center mb-2'>
              <span>Total:</span>
              <span>
                {(
                  ((
                    ticketTypes.find((ticket) => ticket.type === selectedTicket)
                      ?.price || 0) * quantity 
                ).toFixed(2))}
                €
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className='w-full bg-futura-teal hover:bg-futura-teal/90 gap-2'
            onClick={handleAddToCart}
            disabled={isAtMaxLimit()}
          >
            <ShoppingCart className='h-4 w-4' />
            {isAtMaxLimit() ? 'Maximum Limit Reached For This Event' : 'Add to Cart'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className='bg-white/5 border-white/10 text-white'>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <CardTitle className='text-xl text-futura-teal'>
            Select Tickets
          </CardTitle>
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-futura-teal hover:bg-white/5 p-0" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        <RadioGroup value={selectedTicket} onValueChange={(value) => setSelectedTicket(value)} className='space-y-4'>
          {ticketTypes.map((ticket: Ticket, i: number) => {

            const inCart = isInCart(event.id, ticket.type);
            const itemCount = getItemCount(event.id, ticket.type);

            return (
              <div key={i} className={`flex items-start space-x-3 p-3 rounded-md border transition-colors ${inCart ? 'border-futura-teal bg-futura-teal/10' : 'border-white/10 hover:border-futura-teal'}`}>
                <RadioGroupItem
                  value={ticket.type}
                  id={ticket.type}
                  className='mt-1 border-white/30 text-futura-teal'
                />
                <div className='flex-1'>
                  <Label
                    htmlFor={ticket.type}
                    className='text-white font-medium flex justify-between'
                  >
                    <span>{ticket.type}</span>
                    <span className='text-futura-orange'>{ticket.price}€</span>
                  </Label>
                  {/* <p className="text-sm text-gray-400 mt-1">{ticket.description}</p> */}
                  {inCart && (
                    <Badge className='mt-2 bg-futura-teal/20 text-futura-teal border-futura-teal/30 flex items-center w-fit gap-1'>
                      <Check className='h-3 w-3' /> {itemCount} in cart
                    </Badge>
                  )}
                </div>
              </div>
            );
            
          })}
        </RadioGroup>

        <div className='space-y-2'>
          <Label htmlFor='quantity' className='text-white'>
            Quantity
          </Label>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={decrementQuantity}
              className='border-white/10 hover:bg-white/5 hover:text-futura-teal h-9 w-9'
            >
              <Minus className='h-4 w-4' />
            </Button>
            <Input
              id='quantity'
              type='number'
              min='1'
              max={getSelectedTicket()?.availableTickets || 1}
              value={quantity}
              onChange={(e) => {
                const value = Number(e.target.value);
                const totalInCart = getTotalTicketsInCart();
                const GLOBAL_MAX_TICKETS = 3;

                if (value >= 1 && totalInCart + value <= GLOBAL_MAX_TICKETS) {
                  setQuantity(value);
                }
              }}
              className='w-16 text-center bg-white/5 `bg-white/5 border-white/10 gap-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
            <Button
              variant='outline'
              size='icon'
              onClick={incrementQuantity}
              disabled={!canIncrementQuantity()}
              className='border-white/10 hover:bg-white/5 hover:text-futura-teal h-9 w-9 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='pt-4 border-t border-white/10'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-gray-400'>Ticket Price:</span>
            <span>
              {/* obtener el precio de cada entrada */}
              {ticketTypes.find((ticket) => ticket.type === selectedTicket)?.price || 0}
              € × {quantity}
            </span>
          </div>
          {/* <div className='flex justify-between items-center mb-2'>
            <span className='text-gray-400'>Commission:</span>
            <span>
              {calculateCommission(
                ticketTypes.find((ticket) => ticket.type === selectedTicket)
                  ?.price || 0
              ).toFixed(2)}
              € × {quantity}
            </span>
          </div> */}
          <div className='flex justify-between items-center font-bold text-lg pt-2 border-t border-white/10'>
            <span>Total:</span>
            <span>
              {(
                (ticketTypes.find((ticket) => ticket.type === selectedTicket)?.price || 0) * quantity
              ).toFixed(2)}
              €
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className='w-full bg-futura-teal hover:bg-futura-teal/90 gap-2'
          onClick={handleAddToCart}
          disabled={isAtMaxLimit()}
        >
          <ShoppingCart className='h-4 w-4' />
          {isAtMaxLimit() ? 'Maximum Limit Reached' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}

