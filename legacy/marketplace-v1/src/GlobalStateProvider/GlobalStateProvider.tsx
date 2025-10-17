import React from 'react';
import { Account, Cart, Event, EventTicket } from '../shared/interfaces';

export interface GlobalState {
  account: Account | undefined;
  events: Event[];
  menuState: boolean;
  cart: Cart | undefined;
};



const defaultGlobalState: GlobalState = {
  account: undefined,
  events: [],
  menuState: false,
  cart: undefined
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