'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/wishlist-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
  eventId: string;
  variant?: 'default' | 'icon';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function WishlistButton({
  eventId,
  variant = 'icon',
  size = 'icon',
  className = '',
}: WishlistButtonProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);

  const isInList = isInWishlist(eventId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error('Please login to save events to your wishlist');
      router.push('/login?mode=login');
      return;
    }

    setIsLoading(true);

    try {
      await toggleWishlist(eventId);

      if (isInList) {
        toast.success('Removed from wishlist');
      } else {
        toast.success('Added to wishlist', {
          description: 'View your saved events in your wishlist',
          action: {
            label: 'View Wishlist',
            onClick: () => router.push('/wishlist'),
          },
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant === 'icon' ? 'ghost' : 'outline'}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={'group ' + className}
      aria-label={isInList ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={'h-5 w-5 transition-all duration-200 ' + (
          isInList
            ? 'fill-red-500 text-red-500'
            : 'text-gray-400 group-hover:text-red-500 group-hover:scale-110'
        ) + (isLoading ? ' animate-pulse' : '')}
      />
      {variant === 'default' && (
        <span className="ml-2">
          {isInList ? 'Saved' : 'Save Event'}
        </span>
      )}
    </Button>
  );
}
