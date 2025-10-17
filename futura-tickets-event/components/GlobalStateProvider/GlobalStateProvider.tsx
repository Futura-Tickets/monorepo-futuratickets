import React from 'react';

// INTERFACES
import { Account, Item, Event } from '../shared/interfaces';

export interface GlobalState {
  account: Account | undefined;
  items: Item[];
  resaleItems: Item[];
  clientDetails: { name: string; lastName: string; birthdate: Date; email: string; phone: string; } | undefined;
  event: Event | undefined;
  events: Event[];
  menuState: boolean;
  promoCode?: string;
  couponCode?: string;
};

const defaultGlobalState: GlobalState = {
  account: undefined,
  events: [],
  menuState: false,
  items: [],
  resaleItems: [],
  clientDetails: undefined,
  event: undefined,
  promoCode: undefined,
  couponCode: undefined
};

const GlobalStateContext = React.createContext<GlobalState>(defaultGlobalState);
const DispatchStateContext = React.createContext<any>(undefined);

type GlobalProviderProps = { children: React.ReactNode };

const GlobalStateProvider = ({ children }: GlobalProviderProps) => {
  
  const [state, dispatch] = React.useReducer((state: GlobalState, newValue: any) => ({ ...state, ...newValue }), defaultGlobalState);

  return (
    <GlobalStateContext.Provider value={state}>
      <DispatchStateContext.Provider value={dispatch}>
        {children}
      </DispatchStateContext.Provider>
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = (): [GlobalState, any] => [
  React.useContext(GlobalStateContext),
  React.useContext(DispatchStateContext),
];

export default GlobalStateProvider;