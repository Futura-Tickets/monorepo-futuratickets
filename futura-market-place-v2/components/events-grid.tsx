import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import type { EventsGridProps } from '@/app/shared/interface';


export function EventsGrid({ isLoading, events, onViewDetails, searchTerm, onClearSearch, onClearFilters }: EventsGridProps) {
  if (isLoading) {
    return (
      <div className='flex justify-center py-20'>
        <div className='w-12 h-12 border-4 border-gray-700 border-t-futura-teal rounded-full animate-spin'/>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className='bg-white/5 rounded-lg border border-white/10 p-12 text-center'>
        <h3 className='text-xl font-semibold mb-4'>No events found</h3>
        <p className='text-gray-400 mb-6'>
          {searchTerm ? 'Try adjusting your search terms' : 'Try adjusting your filters'}
        </p>
        <Button 
          variant='outline' 
          size="sm"
          onClick={searchTerm ? onClearSearch : onClearFilters}
          className='border-white/10 bg-white/5 text-xs sm:text-sm hover:bg-white/5'
        >
          {searchTerm ? 'Clear Search' : 'Clear Filters'}
        </Button>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {events.map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          onViewDetails={() => onViewDetails(event)} 
        />
      ))}
    </div>
  );
}