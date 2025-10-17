import { Account } from '@/shared/interfaces';
import React from 'react';
import { Notification, Event } from '@/shared/interfaces';

export interface GlobalState {
  isConnected: boolean;
  address: string | undefined;
  menuState: boolean;
  notificationsMenuState: boolean;
  account: Account | undefined;
  events: Event[];
  goBackRoute: string | undefined;
  notifications: Notification[]; 
};

const defaultGlobalState: GlobalState = {
  isConnected: false,
  address: undefined,
  menuState: false,
  account: undefined,
  notificationsMenuState: false,
  notifications: [],
  events: [],
  goBackRoute: undefined
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