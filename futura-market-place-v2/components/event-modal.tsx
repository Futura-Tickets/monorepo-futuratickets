'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Share2, Heart, Info, Users, X, Music, Mic } from 'lucide-react';
import { useState } from 'react';

// COMPONENTS
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Importar Badge para los géneros

// UTILS
import { formatTime } from '@/app/shared/utils';

// INTERFACES
import type { Event } from '@/lib/events-data';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export function EventModal({ isOpen, onClose, event }: EventModalProps) {
  const router = useRouter();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const navigateTo = (eventId: string): void => {
    router.push(`/events/${eventId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className='max-w-2xl w-[calc(100%-2rem)] mx-auto bg-black/95 border-gray-800 p-0 overflow-hidden no-close-button max-h-[85vh] overflow-y-auto rounded-lg flex flex-col md:flex-row'
      >
        {/* Image Section - ajustado para alineación uniforme */}
        <div className='w-full md:w-2/5 relative h-[180px] sm:h-[220px] md:h-auto rounded-t-lg md:rounded-t-none md:rounded-l-lg overflow-hidden'>
          {/* Botón de cierre en la esquina superior izquierda */}
          <Button
            size='icon'
            variant='ghost'
            onClick={onClose}
            className='absolute top-4 left-4 bg-black/70 hover:bg-black/90 rounded-full w-9 h-9 z-50'
          >
            <X className='h-5 w-5 text-white' />
          </Button>

          <Image
            src={event.image || '/placeholder.svg'}
            alt={event.title}
            width={600}
            height={400}
            className='w-full h-full object-cover'
          />
          <div className='absolute top-4 right-4 flex gap-2'>
            <Button
              size='icon'
              variant='secondary'
              className='rounded-full w-8 h-8'
            >
              <Heart className='h-4 w-4' />
            </Button>
            <Button
              size='icon'
              variant='secondary'
              className='rounded-full w-8 h-8'
            >
              <Share2 className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Details Section - ajustado para alineación uniforme */}
        <div className='w-full md:w-3/5 p-4 md:p-5 overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-xl md:text-2xl font-bold'>
              {event.title}
            </DialogTitle>
            {event.organizer && (
              <p className='text-sm text-gray-400'>
                Organized by {event.organizer}
              </p>
            )}
          </DialogHeader>

          <div className='mt-4 md:mt-6 space-y-3 md:space-y-4'>
            {/* Date and Time */}
            <div className='flex items-start gap-3'>
              <Calendar className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
              <div>
                <p className='font-medium'>
                  {event.formattedDate ||
                    (event.date instanceof Date
                      ? event.date.toLocaleDateString()
                      : event.date)}
                </p>
                <div className='flex items-center gap-2 mt-1'>
                  <Clock className='h-4 w-4 text-gray-400' />
                  <p className='text-sm text-gray-400'>
                    {formatTime(event.time)}
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className='flex items-start gap-3'>
              <MapPin className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
              <div>
                <p className='font-medium'>{event.venue}</p>
                <p className='text-sm text-gray-400'>
                  { [
                      event.address,
                      event.city,
                      event.country
                    ].filter(Boolean).join(', ') }
                </p>
              </div>
            </div>

            {/* Géneros - Nuevo */}
            {event.genres && event.genres.length > 0 && (
              <div className='flex items-start gap-3'>
                <Music className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-medium'>Genres</p>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {event.genres.map((genre, index) => (
                      <Badge key={index} variant='secondary' className='text-xs'>
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Artistas - Nuevo */}
            {event.artists && event.artists.length > 0 && (
              <div className='flex items-start gap-3'>
                <Mic className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-medium'>Artists</p>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {event.artists.map((artist, index) => (
                      <Badge key={index} variant='secondary' className='text-xs'>
                        {artist.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className='pt-3 border-t border-gray-800'>
                <div className={isDescriptionExpanded ? '' : 'relative'}>
                  <p className={`text-sm text-gray-300 ${isDescriptionExpanded ? '' : 'line-clamp-3'}`}>
                    {event.description}
                  </p>
                  {!isDescriptionExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/95 to-transparent"></div>
                  )}
                </div>
                <button 
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} 
                  className="text-xs text-primary hover:underline mt-1 focus:outline-none"
                >
                  {isDescriptionExpanded ? 'Show less' : 'Read more'}
                </button>
              </div>
            )}

            {/* Price and CTA */}
            <div className='pt-3 border-t border-gray-800'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-400'>Price</p>
                  <p className='text-lg font-bold text-primary'>
                    {`${event.price}€`}
                  </p>
                </div>
                <Button
                  size='sm'
                  className='px-4 py-2 h-auto'
                  onClick={() => navigateTo(event.url)}
                >
                  Get Tickets
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
