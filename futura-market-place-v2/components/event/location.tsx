'use client';
import { MapPin } from 'lucide-react';
import { EventMap } from '@/components/event-map';

interface EventLocationProps {
  venue: string;
  address: string;
  city?: string;
  coordinates?: [number, number];
}

export function EventLocation({ venue, address, city, coordinates }: EventLocationProps) {
  const locationString = city ? `${address}, ${city}` : address;
  const venueString = venue || 'Venue TBA';

  return (
    <section className='mb-12'>
      <h2 className='text-xl font-semibold text-white mb-4'>Location</h2>
      <div className='bg-white/5 rounded-lg p-6 border border-white/10'>
        <div className='flex items-center gap-2 mb-4'>
          <MapPin className='h-5 w-5 text-futura-teal' />
          <div>
            <p className='text-white font-medium'>{venueString}</p>
            <p className='text-gray-400 text-sm'>{locationString}</p>
          </div>
        </div>
        <EventMap venue={venue} address={address} coordinates={coordinates} />
      </div>
    </section>
  );
}