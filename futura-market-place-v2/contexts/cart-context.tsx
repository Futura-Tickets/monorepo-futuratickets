'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Event } from '@/lib/events-data';

export interface CartItem {
  promoterId: string;
  commission: number;
  id: string;
  resale?: string;
  paymentId?: string;
  resaleId?: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  eventVenue: string;
  promoter: string;
  ticketType: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (event: Event, ticketType: string, quantity: number, resale?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getItemCount: (eventId: string, ticketType: string) => number;
  isInCart: (eventId: string, ticketType: string) => boolean;
  setItems: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  
  const [items, setItems] = useState<CartItem[]>([]);

  const loadCartItems = () => {
    if (typeof window === 'undefined') return;

    const savedCart = localStorage.getItem('futura-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem('futura-cart');
      }
    }
  };

  useEffect(() => {
    loadCartItems();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('futura-cart', JSON.stringify(items));

      window.dispatchEvent(
        new CustomEvent('cart-updated', { detail: { items, totalItems: items.reduce((t, i) => t + i.quantity, 0) } })
      );
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, [items]);

  const addToCart = (event: Event, ticketType: string, quantity: number, resale?: string) => {

    if (quantity <= 0) return;

    const itemId = `${event.id}-${ticketType}`;

    const existingItemIndex = items.findIndex((item) => item.id === itemId);

    if (existingItemIndex >= 0 && resale === undefined) {

      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;

      setItems(updatedItems);

    } else {

      const ticketPriceFound = event.tickets.find((ticket: { type: string; capacity: number; price: number }) => ticket.type === ticketType);
      if (!ticketPriceFound) return;

      const newItem: CartItem = {
        id: itemId,
        resale,
        eventId: event.id,
        eventTitle: event.title,
        eventImage: event.image,
        eventDate: event.formattedDate,
        eventVenue: event.venue,
        promoter: event.organizer, 
        promoterId: event.organizerId, 
        ticketType,
        price: ticketPriceFound.price,
        quantity,
        commission: event.commission || 0,
      };

      setItems((prev) => [...prev, newItem]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = (eventId: string, ticketType: string) => {
    const itemId = `${eventId}-${ticketType}`;
    const item = items.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const isInCart = (eventId: string, ticketType: string) => {
    const itemId = `${eventId}-${ticketType}`;
    return items.some((item) => item.id === itemId);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
 
  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        getItemCount,
        isInCart,
        setItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}