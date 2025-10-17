"use client";
import { useRouter } from 'next/navigation';

// ANTD
import Button from "antd/es/button";
import Checkbox from 'antd/es/checkbox';
import Progress from "antd/es/progress";

// INTERACES
import { Event, EventStatus } from "@/shared/interfaces";

// STYLES
import "./EventsList.scss";

export function EventItem({ event }: { event: Event }) {

    const router = useRouter();

    const navigateTo = (route: string): void => {
        router.push(route);
    };

    return (
        <div className="event-item-container">
            <div className="event-item-content">
                <div className="event-item-select">
                    {event.dateTime.launchDate && (
                        <Checkbox />
                    )}
                </div>
                <div className="event-item-address">{event.name}</div>
                <div className="event-item-progress">
                    {event.status == EventStatus.HOLD ? 'N/A' : <Progress percent={50} showInfo={false} strokeColor="#049b92" trailColor="#e4e4e4"/>}
                </div>
                <div className="event-item-address">{event.location.city}, {event.location.country}</div>
                <div className="event-item-address">{event.capacity}</div>
                <div className="event-item-address">{event.dateTime.launchDate ? new Date(event.dateTime.launchDate).toLocaleDateString() : 'N/A'}</div>
                <div className="event-item-address">{new Date(event.dateTime.startDate).toLocaleDateString()}</div>
                <div className="event-item-address">{new Date(event.dateTime.endDate).toLocaleDateString()}</div>
                <div className="event-item-address">
                    {event.status == EventStatus.HOLD && <div className="hold">{event.status}</div>}
                    {event.status == EventStatus.LAUNCHED && <div className="launched">{event.status}</div>}
                    {event.status == EventStatus.LIVE && <div className="live">{event.status}</div>}
                    {event.status == EventStatus.CLOSED && <div className="closed">{event.status}</div>}
                </div>
                <div className="event-item-action">
                    <Button className="view-details" onClick={() => navigateTo(`/events/${event._id}`)}>View event</Button>
                </div>
            </div>
        </div>
    )
}

export default function EventsList({ events }: { events: Event[] }) {
    return (
        <div className="events-list-container">
            <div className="events-list-header">
                <div className="event-item-select">
                    <Checkbox />
                </div>
                <div className="event-item-address">Name</div>
                <div className="event-item-address">Performance</div>
                <div className="event-item-address">Location</div>
                <div className="event-item-address">Capacity</div>
                <div className="event-item-address">Launch Date</div>
                <div className="event-item-address">Start Date</div>
                <div className="event-item-address">End Date</div>
                <div className="event-item-address">Status</div>
            </div>
            <div className="events-list-content">
                {(!events || events.length === 0) && (
                    <div className="events-not-found">
                        Events not found
                    </div>
                )}
                {Array.isArray(events) && events.map((event: Event, i: number) => {
                    return <EventItem event={event} key={i}/>
                })}
            </div>
        </div>
    );
}