'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// COMPONENTS
import { Header } from '@/components/header';
import { EventModal } from '@/components/event-modal';
import { Filters } from '@/components/filters';
import { EventsGrid } from '@/components/events-grid';
import { ExploreCountries } from '@/components/explore-countries';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { Button } from "@/components/ui/button";

// SERVICES
import { getEvents } from './shared/services/services';

// INTERFACES
import { Artist, EventAPI } from './shared/interface';
import { countries } from '@/lib/countries-data';
import type { Event } from '@/lib/events-data';

// Filter types
type DateFilter = 'all' | 'today' | 'tomorrow' | 'thisWeek' | 'thisMonth';
type GenreFilter = string[];
type VenueFilter = string[];
type PriceRange = { min: number; max: number | null };
type ArtistFilter = string[];

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter states - initialize from URL params
  const [dateFilter, setDateFilter] = useState<DateFilter>((searchParams.get('date') as DateFilter) || 'all');
  const [genreFilters, setGenreFilters] = useState<GenreFilter>(
    searchParams.get('genres') ? searchParams.get('genres')!.split(',') : []
  );
  const [venueFilters, setVenueFilters] = useState<VenueFilter>(
    searchParams.get('venues') ? searchParams.get('venues')!.split(',') : []
  );
  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: Number(searchParams.get('minPrice')) || 0,
    max: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null
  });
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [artistFilters, setArtistFilters] = useState<ArtistFilter>(
    searchParams.get('artists') ? searchParams.get('artists')!.split(',') : []
  );

  // API events state
  const [eventsFromAPI, setEventsFromAPI] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  // Other states
  const [country, setCountry] = useState<string>(searchParams.get('country') || '');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Añadir este nuevo estado para controlar el menú desplegable
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Añadir este useEffect para cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Format date utility function
  const formatDateWithShortMonth = useCallback((date: Date): string => {
    const day = date.getDate();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return `${monthNames[monthIndex]} ${day} ${year}`;
  }, []);

  // Fetch events from API
  const fetchEventsFromAPI = useCallback(async () => {
    try {

      setIsLoading(true);
      const events = await getEvents();

      if (!events || events.length === 0) {
        setIsLoading(false);
        return;
      }

      const parsedEvents: Event[] = events.map((event: EventAPI) => {
        return {
          id: event._id,
          title: event.name,
          venue: event.location.venue,
          coordinates: event.location.lat && event.location.lon ? [event.location.lat, event.location.lon] : undefined,
          date: new Date(event.dateTime.startDate),
          formattedDate: formatDateWithShortMonth(new Date(event.dateTime.startDate)),
          time: event.dateTime.startDate,
          price: event.tickets.length > 0 ? event.tickets[0].price : 0,
          image: `${process.env.NEXT_PUBLIC_BLOB_URL}/${event.image}`,
          country: event.location.country,
          city: event.location.city,
          genres: event.genres || [],
          description: event.description,
          organizer: event.promoter.name,
          address: event.location.address,
          capacity: event.capacity,
          tickets: event.tickets,
          ticketLots: event.ticketLots,
          resale: {
            isResale: event.resale.isResale,
            isActive: event.resale.isActive,
            maxPrice: event.resale.maxPrice,
            royalty: event.resale.royalty,
          },
          artists: event.artists.map((artist: Artist) => ({
            name: artist.name,
            image: artist.image,
          })),
          orders: event.orders,
          maxQuantity: event.maxQuantity,
          commission: event.commission,
          url: event.url,
          availableTickets: event.availableTickets
        };
      });

      setEventsFromAPI(parsedEvents);
      setIsLoading(false);
      
    } catch (error) {
      setIsLoading(false);
    }
  }, [formatDateWithShortMonth]);

  // Countries with available events (using ISO codes)
  const countriesWithEvents = useMemo(() => {
    const countrySet = new Set<string>();
    eventsFromAPI.forEach((event) => {
      if (event?.country) {
        countrySet.add(event.country);
      }
    });
    return Array.from(countrySet);
  }, [eventsFromAPI]);

  // Available countries filtered by data (using ISO codes)
  const availableCountries = useMemo(() => countries.filter((c) =>
      countriesWithEvents.some(
        (countryCode) => countryCode === c.code
      )
    ),
  [countriesWithEvents]
  );

  // Initialize country after loading events
  useEffect(() => {
    if (eventsFromAPI.length > 0 && availableCountries.length > 0) {
      if (!country || !countriesWithEvents.includes(country)) {
        setCountry(availableCountries[0].code);
      }
    }
  }, [eventsFromAPI, countriesWithEvents, availableCountries, country]);

  // Get current country data
  const currentCountry = useMemo(
    () => countries.find((c) => c.code === country) || countries[0],
    [country]
  );

  // Cities filtered by selected country
  const citiesByCountry = useMemo(() => {
    const cities = new Set<string>();
    eventsFromAPI
      .filter((event) => event.country === country)
      .forEach((event) => cities.add(event.city));
    return Array.from(cities);
  }, [eventsFromAPI, country]);

  // Filter functions
  const isInDateRange = useCallback(
    (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      switch (dateFilter) {
        case 'today':
          return date.toDateString() === today.toDateString();
        case 'tomorrow':
          return date.toDateString() === tomorrow.toDateString();
        case 'thisWeek':
          return date >= today && date < nextWeek;
        case 'thisMonth':
          return date >= today && date < nextMonth;
        default:
          return true;
      }
    },
    [dateFilter]
  );

  const matchesGenres = useCallback(
    (eventGenres: string[]) =>
      genreFilters.length === 0 ||
      eventGenres.some((genre) => genreFilters.includes(genre)),
    [genreFilters]
  );

  const matchesVenue = useCallback(
    (venue: string) =>
      venueFilters.length === 0 || venueFilters.includes(venue),
    [venueFilters]
  );

  const matchesPriceRange = useCallback(
    (price: number) =>
      !priceRange.max
        ? price >= priceRange.min
        : price >= priceRange.min && price <= priceRange.max,
    [priceRange]
  );

  const matchesCity = useCallback(
    (eventCity: string) =>
      !selectedCity || eventCity.toLowerCase() === selectedCity.toLowerCase(),
    [selectedCity]
  );

  const matchesArtists = useCallback(
    (eventArtists: { name: string; image?: string }[]) =>
      artistFilters.length === 0 ||
      eventArtists.some((artist) => artistFilters.includes(artist.name)),
    [artistFilters]
  );

  const matchesSearch = useCallback(
    (event: Event) => {
      if (!searchTerm) return true;

      const term = searchTerm.toLowerCase();
      return (
        event.title?.toLowerCase().includes(term) ||
        event.venue?.toLowerCase().includes(term) ||
        event.city?.toLowerCase().includes(term) ||
        event.artists?.some((artist) =>
          artist.name.toLowerCase().includes(term)
        )
      );
    },
    [searchTerm]
  );

  // Featured events derived from API data
  const featuredEvents = useMemo(() => {
    const sortedEvents = [...eventsFromAPI]
      .filter((event) => event.country === country)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedEvents.slice(0, 3);
  }, [country, eventsFromAPI]);

  // Country images from API events (using ISO codes)
  const countryImagesFromAPI = useMemo(() => {
    const images: Record<string, string> = {};
    countriesWithEvents.forEach((countryCode) => {
      const eventWithImage = eventsFromAPI.find(
        (event) => event.country === countryCode && event.image
      );
      if (eventWithImage?.image) {
        images[countryCode] = eventWithImage.image;
      }
    });
    return images;
  }, [eventsFromAPI, countriesWithEvents]);

  // Lists filtered by country
  const artistsByCountry = useMemo(() => {
    const artistsSet = new Set<string>();
    eventsFromAPI
      .filter((event) => event.country === country)
      .forEach((event) => {
        event.artists?.forEach((artist) => {
          if (artist.name) artistsSet.add(artist.name);
        });
      });
    return Array.from(artistsSet).sort();
  }, [eventsFromAPI, country]);

  const genresByCountry = useMemo(() => {
    const genresSet = new Set<string>();
    eventsFromAPI
      .filter((event) => event.country === country)
      .forEach((event) => {
        event.genres?.forEach((genre) => genresSet.add(genre));
      });
    return Array.from(genresSet).sort();
  }, [eventsFromAPI, country]);

  const venuesByCountry = useMemo(() => {
    const venuesSet = new Set<string>();
    eventsFromAPI
      .filter((event) => event.country === country)
      .forEach((event) => {
        if (event.venue) venuesSet.add(event.venue);
      });
    return Array.from(venuesSet).sort();
  }, [eventsFromAPI, country]);

  // Fetch events on component mount
  useEffect(() => {
    fetchEventsFromAPI();
  }, [fetchEventsFromAPI]);

  // Apply all filters
  useEffect(() => {
    if (!eventsFromAPI.length) return;

    setIsLoading(true);
    const filtered = eventsFromAPI.filter(
      (event) =>
        event.country === country &&
        matchesSearch(event) &&
        matchesCity(event.city) &&
        isInDateRange(event.date) &&
        matchesPriceRange(event.price) &&
        matchesVenue(event.venue) &&
        matchesGenres(event.genres) &&
        matchesArtists(event.artists)
    );

    setFilteredEvents(filtered);
    setIsLoading(false);
  }, [
    eventsFromAPI,
    country,
    matchesSearch,
    matchesCity,
    isInDateRange,
    matchesPriceRange,
    matchesVenue,
    matchesGenres,
    matchesArtists,
  ]);

  // Reset filters when country changes
  useEffect(() => {
    setSelectedCity('');
    setGenreFilters([]);
    setVenueFilters([]);
    setArtistFilters([]);
  }, [country]);

  // Update URL with current filters
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (searchTerm) params.set('search', searchTerm);
    if (country) params.set('country', country);
    if (dateFilter !== 'all') params.set('date', dateFilter);
    if (selectedCity) params.set('city', selectedCity);
    if (genreFilters.length > 0) params.set('genres', genreFilters.join(','));
    if (venueFilters.length > 0) params.set('venues', venueFilters.join(','));
    if (artistFilters.length > 0) params.set('artists', artistFilters.join(','));
    if (priceRange.min > 0) params.set('minPrice', priceRange.min.toString());
    if (priceRange.max) params.set('maxPrice', priceRange.max.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';

    router.replace(newUrl, { scroll: false });
  }, [searchTerm, country, dateFilter, selectedCity, genreFilters, venueFilters, artistFilters, priceRange, router]);

  // Update URL when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 500); // Debounce URL updates

    return () => clearTimeout(timer);
  }, [updateURL]);

  // Clear search function
  const clearSearch = () => setSearchTerm('');

  const maxEventPrice = useMemo(() => {
    return Math.max(...eventsFromAPI.map(event => event.price));
  }, [eventsFromAPI]);

  return (
    <div className='min-h-screen bg-gradient-to-b from-futura-dark to-black text-white'>
      <Header />

      <main className='container mx-auto px-4 py-8'>
        <section className='mb-16'>
          <div className='flex items-center gap-2 mb-8'>
            <h2 className='text-4xl font-bold'>
              EVENTS IN {currentCountry.name.toUpperCase()}
            </h2>
            <span className='text-4xl'>{currentCountry.flag}</span>
          </div>

          <div className='space-y-12'>
            {/* Advanced Search Bar */}
            <div className='mb-6'>
              <AdvancedSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onClearSearch={clearSearch}
                events={eventsFromAPI}
                onEventSelect={setSelectedEvent}
              />
            </div>

            <div className='space-y-4'> 
              <Filters
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                genreFilters={genreFilters}
                setGenreFilters={setGenreFilters}
                venueFilters={venueFilters}
                setVenueFilters={setVenueFilters}
                artistFilters={artistFilters}
                setArtistFilters={setArtistFilters}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                citiesByCountry={citiesByCountry}
                genresByCountry={genresByCountry}
                artistsByCountry={artistsByCountry}
                venuesByCountry={venuesByCountry}
                maxEventPrice={maxEventPrice}
              />
              
              {/* Botón para limpiar filtros */}
              {(dateFilter !== 'all' || genreFilters.length > 0 || venueFilters.length > 0 || 
                artistFilters.length > 0 || selectedCity || priceRange.min > 0 || priceRange.max) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateFilter('all');
                    setGenreFilters([]);
                    setVenueFilters([]);
                    setPriceRange({ min: 0, max: null });
                    setSelectedCity('');
                    setArtistFilters([]);
                    setSearchTerm('');
                  }}
                  className="border-white/10 bg-white/5 text-xs sm:text-sm hover:bg-white/5"
                >
                  Clear all filters
                </Button>
              )}
            </div>

            <EventsGrid
              isLoading={isLoading}
              events={filteredEvents}
              onViewDetails={setSelectedEvent}
              searchTerm={searchTerm}
              onClearSearch={clearSearch}
              onClearFilters={() => {
                setDateFilter('all');
                setGenreFilters([]);
                setVenueFilters([]);
                setArtistFilters([]);
                setPriceRange({ min: 0, max: null });
                setSelectedCity('');
                setSearchTerm('');
              }}
            />
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-bold mb-6'>Popular Events</h2>
          <EventsGrid
            isLoading={isLoading}
            events={eventsFromAPI.filter(event => event.country !== country).slice(0, 6)}
            onViewDetails={setSelectedEvent}
            searchTerm=""
            onClearSearch={() => {}}
            onClearFilters={() => {}}
          />
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-bold mb-6'>Explore Countries</h2>
          <ExploreCountries
            availableCountries={availableCountries}
            currentCountry={country}
            countriesWithEvents={countriesWithEvents}
            countryImages={countryImagesFromAPI}
            onCountrySelect={setCountry}
            isLoading={isLoading}
          />
        </section>
      </main>

      {selectedEvent && (
        <EventModal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
        />
      )}
    </div>
  );
}
