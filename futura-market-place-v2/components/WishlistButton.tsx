'use client';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/wishlist-context';
import { Event } from '@/lib/events-data';
import { toast } from 'sonner';

interface WishlistButtonProps {
  event: Event;
  variant?: 'icon' | 'button';
  className?: string;
}

export function WishlistButton({ event, variant = 'icon', className = '' }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(event.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    toggleWishlist(event);

    if (isFavorite) {
      toast.success('Removed from favorites');
    } else {
      toast.success('Added to favorites');
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          isFavorite
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
        } ${className}`}
      >
        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all hover:scale-110 ${
        isFavorite
          ? 'bg-red-500/20 text-red-400'
          : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
      } ${className}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  );
}
