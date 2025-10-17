import { EventCard } from '@/components/event-card';
import type { PopularEventsProps } from '@/app/shared/interface';

export function PopularEvents({ events, country, isLoading }: PopularEventsProps) {
  
  const popularEvents = events.filter((event) => event.country !== country).slice(0, 6);

  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <div className='w-12 h-12 border-4 border-gray-700 border-t-futura-teal rounded-full animate-spin'/>
      </div>
    );
  }

  if (popularEvents.length === 0) {
    return null;
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {popularEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}