import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatTwoDigits } from '@/lib/utils';
import type { EventCardProps } from '@/app/shared/interface';

export function formatLocation(venue: string, city?: string, country?: string) {
  const parts = [];
  if (venue) parts.push(venue);
  if (city) parts.push(city);
  if (country) parts.push(country);
  return parts.join(', ') || 'Location TBA';
}

export function EventCard({ event, onViewDetails, showActions = true }: EventCardProps) {
  // Formatear la URL del evento
  const eventUrl = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') 
    .replace(/^-+|-+$/g, ''); 

  return (
    <Link href={`/events/${eventUrl}`}>
      <Card className='bg-white/5 border-white/10 overflow-hidden hover:border-futura-teal transition-colors group'>
        <div className="bg-gradient-to-b from-futura-dark to-black rounded-lg overflow-hidden">
          <div className="relative h-40 overflow-hidden">
            <Image
              src={event.image || '/placeholder.svg'}
              alt={event.title}
              fill
              className='object-cover transition-transform duration-300 hover:scale-110'
              priority
            />
            <div className='absolute bottom-3 left-3 right-3'>
            <h4 className='text-base font-semibold mb-1 line-clamp-2'>
              {event.title}
            </h4>
            <div className='flex items-center gap-1 text-gray-300'>
              <MapPin className='h-3 w-3 text-futura-teal' />
              <p className='text-sm line-clamp-1'>
                {formatLocation(event.venue)}
              </p>
            </div>
          </div>
          </div>
          
          
        </div>
        <CardContent className='p-3'>
          <div className='flex items-center gap-2 text-gray-300 mb-2 text-sm'>
            <Calendar className='h-3 w-3 text-futura-teal' />
            <span>{event.formattedDate}</span>
            <Clock className='h-3 w-3 text-futura-teal' />
            <p className='text-gray-400'>
              {formatTwoDigits(new Date(event.time).getHours())}:
              {formatTwoDigits(new Date(event.time).getMinutes())}
            </p>
          </div>
          
          <div className='flex items-center gap-1 text-gray-300 text-sm'>
            <MapPin className='h-3 w-3 text-futura-teal' />
            <p className='line-clamp-1'>
              {formatLocation(event.address, event.city)}
            </p>
          </div>
          <div className='h-3'/>
          {showActions && (
            <div className='flex justify-between items-center'>
              <span className='text-sm font-semibold text-futura-orange'>
                {event.price === 0 ? 'Free Entry' : `${event.price}€`}
              </span>
              <Button
                size='sm'
                onClick={(e) => {
                  e.preventDefault(); 
                  onViewDetails?.(event);
                }}
                className='bg-futura-teal hover:bg-futura-teal/90 text-sm h-8 px-3'
              >
                View Details
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}