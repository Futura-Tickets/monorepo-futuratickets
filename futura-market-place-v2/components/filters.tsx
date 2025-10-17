import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Calendar, MapPin, Music, User } from 'lucide-react';
import { CityFilter } from '@/components/city-filter';
import { useState, useEffect } from 'react';
import type { FiltersProps } from '@/app/shared/interface';

// Subcomponentes
function DateFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 sm:gap-2 border-white/10 bg-white/5 text-xs sm:text-sm"
        >
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>
            {value === 'all' ? 'All Dates' : 
             value === 'today' ? 'Today' :
             value === 'tomorrow' ? 'Tomorrow' :
             value === 'thisWeek' ? 'This Week' :
             value === 'thisMonth' ? 'This Month' : value}
          </span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-futura-dark border-white/10">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          <DropdownMenuRadioItem value="all" className="hover:bg-white/5 focus:bg-white/5">
            All Dates
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="today" className="hover:bg-white/5 focus:bg-white/5">
            Today
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="tomorrow" className="hover:bg-white/5 focus:bg-white/5">
            Tomorrow
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="thisWeek" className="hover:bg-white/5 focus:bg-white/5">
            This Week
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="thisMonth" className="hover:bg-white/5 focus:bg-white/5">
            This Month
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GenreFilter({ values, onChange, genres }: { values: string[]; onChange: (value: string[]) => void; genres: string[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 sm:gap-2 border-white/10 bg-white/5 text-xs sm:text-sm"
        >
          <Music className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>{values.length ? `${values.length} Genres` : 'All Genres'}</span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-futura-dark border-white/10">
        {genres.map((genre) => (
          <DropdownMenuCheckboxItem
            key={genre}
            checked={values.includes(genre)}
            onCheckedChange={(checked) => {
              onChange(checked ? [...values, genre] : values.filter((g) => g !== genre));
            }}
            className="hover:bg-white/5 focus:bg-white/5"
          >
            {genre}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ArtistFilter({ values, onChange, artists }: { values: string[]; onChange: (value: string[]) => void; artists: string[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 sm:gap-2 border-white/10 bg-white/5 text-xs sm:text-sm"
        >
          <User className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>{values.length ? `${values.length} Artists` : 'All Artists'}</span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-futura-dark border-white/10">
        {artists.map((artist) => (
          <DropdownMenuCheckboxItem
            key={artist}
            checked={values.includes(artist)}
            onCheckedChange={(checked) => {
              onChange(checked ? [...values, artist] : values.filter((a) => a !== artist));
            }}
            className="hover:bg-white/5 focus:bg-white/5"
          >
            {artist}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function VenueFilter({ values, onChange, venues }: { values: string[]; onChange: (value: string[]) => void; venues: string[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 sm:gap-2 border-white/10 bg-white/5 text-xs sm:text-sm"
        >
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>{values.length ? `${values.length} Venues` : 'All Venues'}</span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-futura-dark border-white/10">
        {venues.map((venue) => (
          <DropdownMenuCheckboxItem
            key={venue}
            checked={values.includes(venue)}
            onCheckedChange={(checked) => {
              onChange(checked ? [...values, venue] : values.filter((v) => v !== venue));
            }}
            className="hover:bg-white/5 focus:bg-white/5"
          >
            {venue}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PriceFilter({ 
  value, 
  onChange,
  maxEventPrice 
}: { 
  value: { min: number; max: number | null }; 
  onChange: (value: { min: number; max: number | null }) => void;
  maxEventPrice: number;
}) {
  const [localMin, setLocalMin] = useState(value.min);
  const [localMax, setLocalMax] = useState(value.max !== null ? value.max : maxEventPrice);

  useEffect(() => {
    if (value.max === null) {
      setLocalMax(maxEventPrice);
    }
  }, [value.max, maxEventPrice]);

  const handleMinChange = (newMin: number) => {
    const min = Math.min(newMin, localMax);
    setLocalMin(min);
    onChange({ min, max: localMax });
  };

  const handleMaxChange = (newMax: number) => {

    const max = Math.max(newMax, localMin || 0);
    setLocalMax(max);
    onChange({ min: localMin, max });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 sm:gap-2 border-white/10 bg-white/5 text-xs sm:text-sm"
        >
          <span>
            € Price
          </span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-futura-dark border-white/10 p-4 w-[300px]">
        <div className="space-y-6">
          {/* Dual Range Slider */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Price Range</label>
            <div className="relative h-2">
              <div className="absolute w-full h-2 bg-white/10 rounded-full" />
              <div
                className="absolute h-2 bg-futura-teal rounded-full"
                style={{
                  left: `${(localMin / maxEventPrice) * 100}%`,
                  right: `${100 - (localMax / maxEventPrice) * 100}%`
                }}
              />
              <input
                type="range"
                min="0"
                max={maxEventPrice}
                value={localMin}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-futura-teal [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-[1] [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-futura-teal [&::-moz-range-thumb]:border-0 [&::-moz	range-thumb]:cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max={maxEventPrice}
                value={localMax}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-futura-teal [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-[1] [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz	range-thumb]:bg-futura-teal [&::-moz	range-thumb]:border-0 [&::-moz	range-thumb]:cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>€0</span>
              <span>€{maxEventPrice}</span>
            </div>
          </div>

          {/* Manual inputs */}
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <label className="text-xs text-gray-400">Min Price</label>
              <Input
                type="number"
                placeholder="Min"
                value={localMin}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                className="w-full bg-white/5 border-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-xs text-gray-400">Max Price</label>
              <Input
                type="number"
                placeholder="Max"
                value={localMax}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                className="w-full bg-white/5 border-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Apply button */}
          <Button
            variant="default"
            size="sm"
            className="w-full bg-futura-teal hover:bg-futura-teal/90"
            onClick={() => document.body.click()}
          >
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function Filters({
  dateFilter,
  setDateFilter,
  genreFilters,
  setGenreFilters,
  venueFilters,
  setVenueFilters,
  artistFilters,
  setArtistFilters,
  priceRange,
  setPriceRange,
  selectedCity,
  setSelectedCity,
  citiesByCountry,
  genresByCountry,
  artistsByCountry,
  venuesByCountry,
  maxEventPrice,
}: FiltersProps) {
  const citiesForFilter = citiesByCountry.map(city => ({
    value: city.toLowerCase(),
    label: city
  }));

  return (
    <div className="space-y-6">
      {/* Todos los filtros en una sola fila */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Date Filter */}
        <DateFilter value={dateFilter} onChange={setDateFilter} />

        {/* City Filter */}
        <CityFilter
          cities={citiesForFilter}
          selectedCity={selectedCity}
          onSelect={setSelectedCity}
        />

        {/* Genre Filter */}
        <GenreFilter
          values={genreFilters}
          onChange={setGenreFilters}
          genres={genresByCountry}
        />

        {/* Artist Filter */}
        <ArtistFilter
          values={artistFilters}
          onChange={setArtistFilters} 
          artists={artistsByCountry}
        />

        {/* Venue Filter */}
        <VenueFilter
          values={venueFilters}
          onChange={setVenueFilters}
          venues={venuesByCountry}
        />

        {/* Price Filter */}
        <PriceFilter
          value={priceRange}
          onChange={setPriceRange}
          maxEventPrice={maxEventPrice}
        />
      </div>
    </div>
  );
}