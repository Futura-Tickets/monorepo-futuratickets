import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { Country } from '@/lib/countries-data';
import type {ExploreCountriesProps} from '@/app/shared/interface';


export function ExploreCountries({
  availableCountries,
  currentCountry,
  countriesWithEvents,
  countryImages,
  onCountrySelect,
  isLoading,
}: ExploreCountriesProps) {
  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <div className='w-12 h-12 border-4 border-gray-700 border-t-futura-teal rounded-full animate-spin'/>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {availableCountries.map((country) => (
        <Button
          key={country.id}
          variant={currentCountry === country.code ? 'default' : 'outline'}
          className='relative h-48 p-0 overflow-hidden border-white/10 hover:border-futura-teal'
          onClick={() => onCountrySelect(country.code)}
        >
          {countryImages[country.code] && (
            <Image
              src={countryImages[country.code]}
              alt={country.name}
              fill
              className='object-cover'
            />
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 to-transparent' />
          <div className='absolute bottom-4 left-4 flex items-center gap-2'>
            <span className='text-2xl'>{country.flag}</span>
            <span className='text-lg font-semibold'>{country.name}</span>
          </div>
        </Button>
      ))}
    </div>
  );
}