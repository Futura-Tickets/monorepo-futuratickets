'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { EventAPI } from '@/app/shared/interface';
import { getWishlist, addToWishlist as addToWishlistService, removeFromWishlist as removeFromWishlistService } from '@/app/shared/services/services';
import { useAuth } from './auth-context';

interface WishlistContextType {
  wishlist: EventAPI[];
  wishlistIds: string[];
  isLoading: boolean;
  isInWishlist: (eventId: string) => boolean;
  addToWishlist: (eventId: string) => Promise<void>;
  removeFromWishlist: (eventId: string) => Promise<void>;
  toggleWishlist: (eventId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const [wishlist, setWishlist] = useState<EventAPI[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load wishlist when user logs in
  useEffect(() => {
    if (isLoggedIn && !isAuthLoading) {
      loadWishlist();
    } else if (!isLoggedIn && !isAuthLoading) {
      // Clear wishlist when user logs out
      setWishlist([]);
      setWishlistIds([]);
    }
  }, [isLoggedIn, isAuthLoading]);

  const loadWishlist = async () => {
    if (!isLoggedIn) return;

    setIsLoading(true);
    try {
      const events = await getWishlist();
      setWishlist(events);
      setWishlistIds(events.map((event) => event._id));
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlist([]);
      setWishlistIds([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (eventId: string) => {
    if (!isLoggedIn) {
      throw new Error('You must be logged in to add events to wishlist');
    }

    try {
      await addToWishlistService(eventId);

      // Optimistically update local state
      setWishlistIds((prev) => [...prev, eventId]);

      // Refresh to get full event data
      await loadWishlist();
    } catch (error) {
      // Revert optimistic update on error
      setWishlistIds((prev) => prev.filter((id) => id !== eventId));
      throw error;
    }
  };

  const removeFromWishlist = async (eventId: string) => {
    if (!isLoggedIn) {
      throw new Error('You must be logged in to remove events from wishlist');
    }

    try {
      await removeFromWishlistService(eventId);

      // Optimistically update local state
      setWishlistIds((prev) => prev.filter((id) => id !== eventId));
      setWishlist((prev) => prev.filter((event) => event._id !== eventId));
    } catch (error) {
      // Refresh to get correct state on error
      await loadWishlist();
      throw error;
    }
  };

  const toggleWishlist = async (eventId: string) => {
    if (isInWishlist(eventId)) {
      await removeFromWishlist(eventId);
    } else {
      await addToWishlist(eventId);
    }
  };

  const isInWishlist = (eventId: string): boolean => {
    return wishlistIds.includes(eventId);
  };

  const refreshWishlist = async () => {
    await loadWishlist();
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        isLoading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
