'use client';
import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import Image from 'next/image';
import { Calendar, Clock, Music, Globe, Heart, MapPin, Share2, Ticket, Repeat, Users, Mic } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// COMPONENTS
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Header } from '@/components/header';
import { EventDescription } from '@/components/event/description';
import { EventLocation } from '@/components/event/location';
import { EventFAQs } from '@/components/event/faqs';
import { EventConditions } from '@/components/event/conditions';
import { Badge } from '@/components/ui/badge';
import { TicketSelector } from '@/components/ticket-selector';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

// SERVICES
import { countries } from '@/lib/countries-data';
import { getEventByUrl } from '@/app/shared/services/services';

// UTILS
import { formatTwoDigits } from '@/lib/utils';

// INTERFACES
import type { Event as BaseEvent } from '@/lib/events-data';
import type { Artist } from '@/app/shared/interface';


interface Event extends BaseEvent {
  details?: {
    age?: string;
    hours?: string;
    venue?: string;
    address?: string;
    cityCode?: string;
    membership?: string;
  };
  organizerId: string | null;
  coordinates?: [number, number];
  conditions?: { title: string; description: string }[];
  faqs?: { title: string; description: string }[];
};

const shortMonths: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDateWithShortMonth = (date: Date): string => {
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  return `${shortMonths[monthIndex]} ${day}, ${year}`;
};

const parseCoordinates = (lat: string | number | undefined | null, lon: string | number | undefined | null): [number, number] | undefined => {

  const numLat = typeof lat === 'string' ? Number.parseFloat(lat) : lat;
  const numLon = typeof lon === 'string' ? Number.parseFloat(lon) : lon;

  if (typeof numLat === 'number' && !isNaN(numLat) && typeof numLon === 'number' && !isNaN(numLon)) return [numLat, numLon];
  return undefined;

};

const createGoogleCalendarUrl = (event: Event): string => {
  const startDate = new Date(event.date);
  const endDate = new Date(event.date);

  const details= `
  ${event.description || ''}

  Venue: ${event.venue}
  Address: ${event.address}
  City: ${event.city}
  `;
 const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate.toISOString().replace(/-|:|\.\d+/g, '')}/${endDate.toISOString().replace(/-|:|\.\d+/g, '')}`,
    details: details,
    location: `${event.venue}, ${event.address}, ${event.city}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export default function EventPage({ params }: { params: Promise<{ id: string }>; }) {

  const { id: eventId } = use(params);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isInterested, setIsInterested] = useState(false);
  const [isReminder, setIsReminder] = useState(false);
  const [isTicketSelectorOpen, setIsTicketSelectorOpen] = useState(false);
  const [event, setEvent] = useState<Event>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const handlePromoCode = () => {
    const promoCode = searchParams.get('promoCode');
    
    if (promoCode) {
      sessionStorage.setItem('futura-promo-code', promoCode);
    } else {
      sessionStorage.removeItem('futura-promo-code');
      setPromoMessage(null);
    }
  };

  const handleBeforeUnload = useCallback(() => {
    const currentPromoCode = searchParams.get('promoCode');
    if (!currentPromoCode) {
      sessionStorage.removeItem('futura-promo-code');
      localStorage.removeItem('futura-promo-code');
    }
  }, [searchParams]);

  useEffect(() => {
    handlePromoCode();
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [searchParams, handleBeforeUnload]);

  const fetchEventData = async (eventId: string): Promise<void> => {
    try {

      setIsLoading(true);
      const eventData = await getEventByUrl(eventId);

      if (!eventData) {
        setError('Event not found');
        return;
      }

      const parsedEvent: Event = {
        id: eventData._id,
        title: eventData.name,
        venue: eventData.location.venue,
        date: eventData.dateTime.startDate,
        formattedDate: formatDateWithShortMonth(new Date(eventData.dateTime.startDate)),
        time: eventData.dateTime.startDate,
        price: eventData.tickets.length > 0 ? eventData.tickets[0].price : 0,
        image: eventData.image ? `${process.env.NEXT_PUBLIC_BLOB_URL}/${eventData.image}` : '/placeholder.svg',
        country: eventData.location.country,
        city: eventData.location.city,
        address: eventData.location.address,
        genres: eventData.genres || [],
        description: eventData.description,
        resale: eventData.resale || false,
        organizer: eventData.promoter.name,
        organizerId: eventData.promoter._id, 
        capacity: eventData.capacity,
        coordinates: parseCoordinates(
          eventData.location.lat,
          eventData.location.lon
        ),
        tickets: eventData.tickets,
        ticketLots: eventData.ticketLots,
        artists: eventData.artists.map((artist: Artist) => ({
          name: artist.name,
          image: artist.image,
        })),
        orders: eventData.orders,
        maxQuantity: eventData.maxQuantity,
        commission: eventData.commission,
        details: eventData.details,
        url: eventData.url,
        conditions: eventData.conditions?.map((condition: any) => ({
          title: condition.title,
          description: condition.description,
        })),
        faqs: eventData.faqs?.map((faq: any) => ({
          title: faq.title,
          description: faq.description,
        })),
        availableTickets: event?.availableTickets!
      };

      setEvent(parsedEvent);
      
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Failed to load event data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    eventId && fetchEventData(eventId);
  }, [eventId]);

  useEffect(() => {
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event?.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const eventCountry = countries.find((c) => c.name === event?.country);

  const locationString = `${event?.address}, ${event?.city}`;
  const venueString = event?.venue || 'Venue TBA';

  const eventTime = new Date(event?.time!);
  const formattedTime = `${formatTwoDigits(eventTime.getHours())}:${formatTwoDigits(eventTime.getMinutes())}`;

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black flex items-center justify-center'>
        <div className='w-16 h-16 border-4 border-gray-700 border-t-futura-teal rounded-full animate-spin'/>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black flex items-center justify-center'>
        <div className='text-center p-6 bg-white/5 rounded-lg border border-white/10 max-w-md'>
          <h2 className='text-2xl font-bold text-white mb-4'>
            Event Not Found
          </h2>
          <p className='text-gray-300 mb-6'>
            {error ||
              "The event you're looking for doesn't exist or has been removed."}
          </p>
          <Link href='/'>
            <Button className='bg-futura-teal hover:bg-futura-teal/90'>
              Return to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header />
      
      {/* Hero Section con imagen */}
      <div className='relative '>
        <div className='relative h-[30vh] sm:h-[40vh] md:h-[60vh]'>
          <Image
            src={event?.image!}
            alt={event?.title!}
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-t from-futura-dark via-futura-dark/50 to-transparent' />
        </div>
      </div>

      <div className='container mx-auto px-4 -mt-32 relative z-10'>
        <div className='max-w-4xl'>
          <div className='flex items-center gap-2 mb-4'>
            {event?.organizer && (
              <Badge
                variant='outline'
                className='text-futura-teal border-futura-teal'
              >
                {event?.organizer}
              </Badge>
            )}
            {eventCountry && (
              <Badge variant='outline' className='flex items-center gap-1 text-futura-teal border-futura-teal'>
                <Globe className='h-3 w-3' />
                <span>{eventCountry.flag} {event?.country}</span>
              </Badge>
            )}
          </div>

          <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-6'>
            {event?.title}
          </h1>

          {/* Mostrar mensaje del código promocional si existe */}
          {promoMessage && (
            <div className='mb-6 py-2 px-4 bg-futura-teal/20 rounded-md text-futura-teal text-sm'>
              {promoMessage}
            </div>
          )}

          <div className='grid gap-6 grid-cols-1 md:grid-cols-2 mb-8'>
            <div className='flex items-start gap-3'>
              <Calendar className='h-6 w-6 text-futura-teal mt-1' />
              <div>
                <p className='font-medium text-white'>{event?.formattedDate}</p>
                <div className='flex items-center gap-2 mt-1'>
                  <Clock className='h-4 w-4 text-gray-400' />
                  <p className='text-gray-400'>{formattedTime}</p>
                </div>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <MapPin className='h-6 w-6 text-futura-teal mt-1' />
              <div>
                <p className='font-medium text-white'>{venueString}</p>
                <p className='text-gray-400 text-sm mt-1'>{locationString}</p>
              </div>
            </div>
          </div>
          
          {/* Grid de 3 columnas para géneros y artistas */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            {event?.genres && event?.genres.length > 0 && (
              <div className='flex items-start gap-3'>
                <Music className='h-6 w-6 text-futura-teal mt-1' />
                <div>
                  <p className='font-medium text-white'>Genres</p>
                  <div className='flex flex-wrap gap-2 mt-1'>
                  {event?.genres.map((genre: string, index: number) => (
                    <Badge key={index} variant='secondary' className='bg-white/10 hover:bg-white/20'>
                      {genre}
                    </Badge>
                  ))}
                  </div>
                </div>
              </div>
            )}
            {event?.artists && event?.artists.length > 0 && (
              <div className='flex items-start gap-3'>
                <Mic className='h-6 w-6 text-futura-teal mt-1' />
                <div>
                  <p className='font-medium text-white'>Artistas</p>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {event?.artists.map((artist: { name: string }, index: number) => (
                      <Badge key={index} variant='secondary' className='bg-white/10 hover:bg-white/20'>
                        {artist.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className='flex flex-wrap gap-3 sm:gap-4 mb-12'>
            <Button
              
              onClick={() => {
                setIsReminder(!isReminder)
              window.open(createGoogleCalendarUrl(event!), '_blank');
              }}
              variant='outline' className='gap-2 border-white/20 hover:border-futura-teal hover:text-futura-teal'
              
            >
              <Calendar className='h-4 w-4' /> ADD TO CALENDAR
            </Button>
            <Button
              variant={isInterested ? 'default' : 'outline'}
              onClick={() => setIsInterested(!isInterested)}
              className={`gap-2 ${
                isInterested
                  ? 'bg-futura-orange hover:bg-futura-orange/90'
                  : 'border-white/20 hover:border-futura-orange'
              }`}
            >
              <Heart className='h-4 w-4' />
              INTERESTED
            </Button>

            {event?.resale.isActive && (
              <Link href={`/events/${event?.url}/resales`}>
                <Button
                  variant='outline' className='gap-2 border-white/20 hover:border-futura-teal hover:text-futura-teal'>
                  <Repeat className='h-4 w-4' /> RESALE MARKET
                </Button>
              </Link>
              
            )}

            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='gap-2 border-white/20 hover:border-futura-teal hover:text-futura-teal'
                >
                  <Share2 className='h-4 w-4' />
                  SHARE
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-futura-dark border-white/10 w-56">
                {/* Social Media */}
                <div className="p-2">
                  <h4 className="text-xs text-gray-400 mb-2 px-2">Social Media</h4>
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event?.title!)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-white/10 transition-colors"
                  >
                    <svg 
                      className="h-4 w-4" 
                      viewBox="0 0 50 50" 
                      fill="currentColor"
                    >
                      <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z" />
                    </svg>
                    X
                  </a>
                  {/* <a 
                    href={`https://www.instagram.com/direct/new?text=${encodeURIComponent(`Check out this event: ${event?.title!} ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-white/10 transition-colors"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    Instagram
                  </a> */}
                  <a 
                    href={`sms:?body=${encodeURIComponent(`Check out this event: ${event?.title!} ${window.location.href}`)}`}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-white/10 transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    SMS
                  </a>
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(`${event?.title!} ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-white/10 transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                {/* Copy Link */}
                <div className="p-2">
                  <h4 className="text-xs text-gray-400 mb-2 px-2">Other Options</h4>
                  <Button
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-white/10 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: 'Link Copied Successfully',
                        description: 'The event link has been copied to your clipboard.',
                        variant: 'success',
                        duration: 2000,
                      });
                    }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    Copy Link
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
              
          </div>

          <section className='mb-12 overflow-hidden rounded-lg'>
            <div className='relative h-[300px] md:h-[400px] w-full'>
              <Image
                src={event?.image!}
                alt={event?.title!}
                fill
                className='object-cover'
                priority
              />
            </div>
          </section>

          <EventDescription description={event?.description!} />
          
          <EventConditions conditions={event?.conditions!} />
          
          <section className='mb-12'>
            <h2 className='text-xl font-semibold text-white mb-4'>Tickets</h2>
            <div className='bg-white/5 rounded-lg p-6 border border-white/10'>
              <div className='grid md:grid-cols-2 gap-6'>
                <div>
                  <p className='text-gray-400 mb-1'>Price from</p>
                  <p className='text-2xl font-bold text-futura-orange'>
                    {event?.price === 0 ? 'Free Entry' : `${event?.price}€`}
                  </p>
                  <div className='mt-4 space-y-2'>
                    {event?.tickets.map((ticket, index) => (
                      <div key={index} className='flex justify-between text-sm'>
                        <span>{ticket.type} Ticket</span>
                        <span>{ticket.price}€</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='flex flex-col justify-between'>
                  <p className='text-gray-300 mb-4'>
                    Select your preferred ticket type and quantity
                  </p>
                  <Dialog
                    open={isTicketSelectorOpen}
                    onOpenChange={setIsTicketSelectorOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size='lg'
                        className='bg-futura-teal hover:bg-futura-teal/90 gap-2 w-full md:w-auto'
                      >
                        <Ticket className='h-4 w-4' />
                        Get Tickets
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='bg-futura-dark border-white/10 p-6 max-w-md'>
                      <TicketSelector event={event!} onClose={() => setIsTicketSelectorOpen(false)}/>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </section>

          <section className='mb-12'>
            <TicketSelector event={event!} compact={true} />
          </section>

          <EventLocation 
            venue={event?.venue!} 
            address={event?.address!}
            city={event?.city}
            coordinates={event?.coordinates}
          />
          
          <EventFAQs faqs={event?.faqs!} />
        </div>
      </div>
    </div>
  );
}
