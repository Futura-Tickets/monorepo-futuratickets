import React from 'react';

export interface Location {
    address: string;
    city: string;
    country: string;
    postalCode: string;
};

export interface ActiveEvent {
    id: number;
    title: string;
    description: string;
    conditions: string;
    location: Location;
    date: number;
    start: string;
    end: string;
    invitations: number;
    guests: number[];
};

export interface GlobalState {
    eventId: number | undefined;
    token: string | undefined;
    role: string | undefined;
    connected: boolean;
    account: string | undefined;
};

const defaultGlobalState: GlobalState = {
    eventId: undefined,
    token: undefined,
    role: undefined,
    connected: false,
    account: undefined,
};

const GlobalStateContext = React.createContext(defaultGlobalState);
const DispatchStateContext = React.createContext<any>(undefined);

type GlobalProviderProps = { children: React.ReactNode };

export const GlobalStateProvider = ({ children }: GlobalProviderProps) => {

    const [state, dispatch] = React.useReducer(
        (state: any, newValue: any) => ({ ...state, ...newValue }),
        defaultGlobalState
    );

    return (
        <GlobalStateContext.Provider value={state}>
            <DispatchStateContext.Provider value={dispatch}>
                {children}
            </DispatchStateContext.Provider>
        </GlobalStateContext.Provider>
    );
};

export const useGlobalState = () => [
    React.useContext(GlobalStateContext),
    React.useContext(DispatchStateContext),
];