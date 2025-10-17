'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { useWishlist } from '@/contexts/wishlist-context';
import { useAuth } from '@/contexts/auth-context';
import { Heart, Calendar, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';

export default function WishlistPage() {
  const router = useRouter();
  const { isLoggedIn, isAuthLoading } = useAuth();
  const { wishlist, isLoading, removeFromWishlist } = useWishlist();

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      toast.error('Please login to view your wishlist');
      router.push('/login?mode=login');
    }
  }, [isLoggedIn, isAuthLoading, router]);

  const handleRemove = async (eventId: string, eventName: string) => {
    try {
      await removeFromWishlist(eventId);
      toast.success(`Removed ${eventName} from wishlist`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove event');
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-futura-dark to-black text-white">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-futura-teal"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-futura-dark to-black text-white">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-futura-teal fill-futura-teal" />
            <h1 className="text-4xl font-bold">My Wishlist</h1>
          </div>
          <p className="text-gray-400">
            {wishlist.length === 0
              ? 'Save your favorite events here'
              : `${wishlist.length} event${wishlist.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Heart className="h-16 w-16 text-gray-600 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-gray-400 mb-6 text-center max-w-md">
                Start saving events you are interested in by clicking the heart icon
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-futura-teal hover:bg-futura-teal/90"
              >
                Browse Events
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((event) => (
              <Card
                key={event._id}
                className="bg-white/5 border-white/10 hover:border-futura-teal/50 transition-all overflow-hidden group cursor-pointer"
              >
                <Link href={`/?event=${event._id}`}>
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${event.image}`}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/50 hover:bg-black/70"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(event._id, event.name);
                        }}
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Link>

                <CardContent className="p-4">
                  <Link href={`/?event=${event._id}`}>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-futura-teal transition-colors line-clamp-1">
                      {event.name}
                    </h3>

                    {event.dateTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(event.dateTime.startDate), 'PPP')}
                        </span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {event.location.venue}, {event.location.city}
                        </span>
                      </div>
                    )}

                    {event.ticketLots && event.ticketLots.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-futura-teal">
                          From ¬{event.ticketLots[0].price}
                        </span>
                        <Button
                          size="sm"
                          className="bg-futura-teal hover:bg-futura-teal/90"
                        >
                          Buy Tickets
                        </Button>
                      </div>
                    )}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
