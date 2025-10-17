'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CityFilterProps {
  cities: { value: string; label: string }[];
  selectedCity: string;
  onSelect: (city: string) => void;
}

export function CityFilter({
  cities,
  selectedCity,
  onSelect,
}: CityFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant='outline' 
          size="sm"
          className='flex items-center gap-1 sm:gap-2 border-white/10 bg-white/5 text-xs sm:text-sm justify-between'
        >
          {selectedCity || 'Select City'}
          <ChevronDown className='h-3 w-3 sm:h-4 sm:w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='bg-futura-dark border-white/10'>
        <DropdownMenuItem
          onClick={() => onSelect('')}
          className={`hover:bg-white/5 focus:bg-white/5 ${!selectedCity ? 'bg-white/5' : ''}`}
        >
          All Cities
        </DropdownMenuItem>
        {cities.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => onSelect(label)}
            className={`hover:bg-white/5 focus:bg-white/5 ${selectedCity.toLowerCase() === label.toLowerCase() ? 'bg-white/5' : ''}`}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
