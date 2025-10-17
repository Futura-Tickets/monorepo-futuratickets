'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Event } from '@/lib/events-data';

interface AdvancedSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  events: Event[];
  onEventSelect: (event: Event) => void;
}

interface SearchSuggestion {
  type: 'event' | 'artist' | 'venue' | 'city';
  text: string;
  event?: Event;
}

const RECENT_SEARCHES_KEY = 'futura_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function AdvancedSearch({
  searchTerm,
  onSearchChange,
  onClearSearch,
  events,
  onEventSelect
}: AdvancedSearchProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  // Save search to recent searches
  const saveSearch = (term: string) => {
    if (!term.trim()) return;

    const updated = [
      term,
      ...recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase())
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Generate suggestions based on search term
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const newSuggestions: SearchSuggestion[] = [];

    // Event name suggestions
    const eventMatches = events.filter(event =>
      event.title.toLowerCase().includes(term)
    ).slice(0, 3);

    eventMatches.forEach(event => {
      newSuggestions.push({
        type: 'event',
        text: event.title,
        event
      });
    });

    // Artist suggestions
    const artistSet = new Set<string>();
    events.forEach(event => {
      event.artists?.forEach(artist => {
        if (artist.name.toLowerCase().includes(term) && !artistSet.has(artist.name)) {
          artistSet.add(artist.name);
        }
      });
    });
    Array.from(artistSet).slice(0, 3).forEach(artist => {
      newSuggestions.push({
        type: 'artist',
        text: artist
      });
    });

    // Venue suggestions
    const venueSet = new Set<string>();
    events.forEach(event => {
      if (event.venue?.toLowerCase().includes(term) && !venueSet.has(event.venue)) {
        venueSet.add(event.venue);
      }
    });
    Array.from(venueSet).slice(0, 3).forEach(venue => {
      newSuggestions.push({
        type: 'venue',
        text: venue
      });
    });

    // City suggestions
    const citySet = new Set<string>();
    events.forEach(event => {
      if (event.city?.toLowerCase().includes(term) && !citySet.has(event.city)) {
        citySet.add(event.city);
      }
    });
    Array.from(citySet).slice(0, 2).forEach(city => {
      newSuggestions.push({
        type: 'city',
        text: city
      });
    });

    setSuggestions(newSuggestions.slice(0, 8));
  }, [searchTerm, events]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchFocused) return;

    const totalSuggestions = searchTerm
      ? suggestions.length
      : recentSearches.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < totalSuggestions - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : totalSuggestions - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (searchTerm && suggestions[highlightedIndex]) {
            handleSuggestionClick(suggestions[highlightedIndex]);
          } else if (!searchTerm && recentSearches[highlightedIndex]) {
            handleRecentSearchClick(recentSearches[highlightedIndex]);
          }
        } else if (searchTerm) {
          saveSearch(searchTerm);
          setIsSearchFocused(false);
        }
        break;
      case 'Escape':
        setIsSearchFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'event' && suggestion.event) {
      onEventSelect(suggestion.event);
      onSearchChange('');
      setIsSearchFocused(false);
    } else {
      onSearchChange(suggestion.text);
      saveSearch(suggestion.text);
    }
    setHighlightedIndex(-1);
  };

  const handleRecentSearchClick = (term: string) => {
    onSearchChange(term);
    setHighlightedIndex(-1);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <TrendingUp className="h-4 w-4 text-futura-teal" />;
      case 'artist':
        return <span className="text-futura-teal">🎤</span>;
      case 'venue':
        return <span className="text-blue-400">📍</span>;
      case 'city':
        return <span className="text-purple-400">🏙️</span>;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          className="w-full pl-10 pr-10 bg-white/5 border-white/10 focus:border-futura-teal h-12 text-base"
          placeholder="Search events, artists, venues or cities..."
          value={searchTerm}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsSearchFocused(true)}
          onKeyDown={handleKeyDown}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              onClearSearch();
              setHighlightedIndex(-1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown with suggestions or recent searches */}
      {isSearchFocused && (
        <div className="absolute top-full mt-2 w-full bg-futura-dark border border-white/10 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {searchTerm ? (
            // Show suggestions
            suggestions.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs text-gray-400 font-semibold">
                  SUGGESTIONS
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left ${
                      highlightedIndex === index ? 'bg-white/10' : ''
                    }`}
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{suggestion.text}</div>
                      <div className="text-xs text-gray-400 capitalize">{suggestion.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                No suggestions found for "{searchTerm}"
              </div>
            )
          ) : (
            // Show recent searches
            recentSearches.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-semibold">RECENT SEARCHES</span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-futura-teal hover:text-futura-teal/80"
                  >
                    Clear all
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left ${
                      highlightedIndex === index ? 'bg-white/10' : ''
                    }`}
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{search}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                No recent searches
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
