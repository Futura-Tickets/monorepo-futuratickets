"use client";
import { useEffect, useState } from 'react';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// COMPONENTS
import EventItem from './EventItem/EventItem';

// SERVICES
import { getEvents } from '../shared/services';

// INTERFACES
import { Event } from '../shared/interfaces';

// STYLES
import './Events.scss';

export default function Events() {

    const [state, dispatch] = useGlobalState();
    const [loader, setLoader] = useState<boolean>(false);

    const setEvents = async(): Promise<void> => {
        try {

            setLoader(true);

            const events = await getEvents();

            dispatch({ events });

            setLoader(false);

        } catch (error) {
            setLoader(false);
        }
    };

    useEffect(() => {
        setEvents();
    }, []);

    if (loader) {
        return (
            <div className="events-container loading">
                <div className="events-content">
                    <h1>Loading Events</h1>
                </div>
            </div>
        )
    }

    return (
        state.events?.length > 0 ? (
            <div className="events-container">
                <div className="events-content">
                    {state.events?.map((event: Event, i: number) => {
                        return (
                            <EventItem event={event} key={i}/>
                        );
                    })}
                </div>
            </div>
        ): (
            <div className="events-container not-found">
                <div className="events-content">
                    <h1>No events found</h1>
                </div>
            </div>
        )
    );
};