'use client';
import { useWishlist } from '@/contexts/wishlist-context';
import { Heart, Calendar, MapPin } from 'lucide-react';
import { WishlistButton } from './WishlistButton';
import Image from 'next/image';

export function FavoritesSection() {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16 bg-white/5 border border-white/10 rounded-lg">
        <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No favorites yet</h3>
        <p className="text-gray-400 mb-6">
          Start adding events to your favorites to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-futura-teal">My Favorites</h2>
          <p className="text-gray-400 mt-1">{wishlist.length} {wishlist.length === 1 ? 'event' : 'events'} saved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((event) => (
          <div
            key={event.id}
            className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-all group"
          >
            <div className="relative h-48">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <WishlistButton event={event} />
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">
                {event.title}
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{event.venue}, {event.city}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div>
                  <span className="text-xs text-gray-400">From</span>
                  <div className="text-lg font-bold text-futura-teal">
                    €{event.price.toFixed(2)}
                  </div>
                </div>

                <button className="bg-futura-teal px-4 py-2 rounded-md hover:bg-futura-teal/90 font-semibold text-sm transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
