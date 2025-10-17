"use client";
import { useRouter } from 'next/navigation';

// ANTD
import Button from "antd/es/button";

// INTERFACES
import { Event } from "@/shared/interfaces";

// STYLES
import './NextEvents.scss';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function NextEvents({ events }: { events: Event[]}) {

    return (
        <div className="next-events-container">
            <div className="next-events-header">
                <h1>Next Events</h1>
            </div>
            <div className="next-events-content">
                {events.map((event: Event, i: number) => {
                    return (
                        <NextEvent event={event} key={i}/>
                    );
                })}
            </div>
        </div>
    );
}

function NextEvent({ event }: { event: Event}) {

    const router = useRouter();

    const navigateTo = (route: string): void => {
        router.push(route);
    };

    return (
        <div className="next-event-container">
            <span className="next-event-name">{event.name}</span>
            <span className="next-event-date">{new Date(event.dateTime.startDate).getDay()} {months[new Date(event.dateTime.startDate).getMonth()]} - {event.capacity} asistentes</span>
            <Button className="view-details" onClick={() => navigateTo(`/events/${event._id}`)}>View Event</Button>
        </div>
    )
}