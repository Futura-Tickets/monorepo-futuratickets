import { EventCard } from '@/components/event-card';
import type { Event } from '@/lib/events-data';
import type {FeaturedEventsProps} from '@/app/shared/interface';


export function FeaturedEvents({ events, isLoading }: FeaturedEventsProps) {
  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <div className='w-12 h-12 border-4 border-gray-700 border-t-futura-teal rounded-full animate-spin'/>
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}