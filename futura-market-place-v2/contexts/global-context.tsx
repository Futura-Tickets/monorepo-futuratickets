'use client';
import { createContext, useContext, type ReactNode, useState, useEffect, Dispatch, SetStateAction } from 'react';

import { Country, countries } from '@/lib/countries-data';

interface GlobalContextType {
    availableCountries: Country[];
    countries: Country[];
    eventCountries: string[];
    currentCountry: Country;
    citiesByCountry: string[];
    setAvailableCountries: Dispatch<SetStateAction<Country[]>>;
    setCitiesByCountry: Dispatch<SetStateAction<string[]>>;
};

const globalContextState: GlobalContextType = {
    availableCountries: [],
    countries,
    eventCountries: [],
    currentCountry: countries[0],
    citiesByCountry: [],
    setAvailableCountries: (): void => {},
    setCitiesByCountry: (): void => {}
};

const GlobalContext = createContext<GlobalContextType | undefined>(globalContextState);

export function GlobalProvider({ children }: { children: ReactNode }) {

    const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
    const [citiesByCountry, setCitiesByCountry] = useState<string[]>([]);

    return (
        <GlobalContext.Provider value={{
            ...globalContextState,
            availableCountries,
            setAvailableCountries,
            citiesByCountry,
            setCitiesByCountry
        }}>
          {children}
        </GlobalContext.Provider>
    );

}

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (context === undefined) {
      throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};