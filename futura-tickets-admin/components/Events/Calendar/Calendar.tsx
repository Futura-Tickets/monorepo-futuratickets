"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ANTD
import Tooltip from 'antd/es/tooltip';
import { Calendar as AntCalendar, Button, theme } from 'antd';
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import { CalendarOutlined, FilterOutlined, GlobalOutlined, PlusOutlined } from '@ant-design/icons';

// COMPONENTS
import GoBack from '@/shared/GoBack/GoBack';

// SERVICES
import { getEvents } from "@/shared/services";

// STYLES
import "./Calendar.scss";

// INTERACES
import { Event } from "@/shared/interfaces";

// CONSTANTS
const color = '#333333';




export default function Calendar() {

    const router = useRouter();

    const [events, setEventsState] = useState<Event[]>([]);
    const [loader, setLoader] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const navigateTo = (route: string): void => {
        router.push(route);
    };

    const setEvents = async(): Promise<void> => {
        try {
    
            setLoader(true);
    
            const events = await getEvents();
            setEventsState(events);
    
            setLoader(false);
    
        } catch (error) {
          setError(true);
          setLoader(false);
        }
    };

    const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
        console.log(value.format('YYYY-MM-DD'), mode);
      };

    useEffect(() => {
        setEvents();
    }, []);

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <GoBack route="/events"/>
                <h1><CalendarOutlined /> Calendar</h1>
                <div className="calendar-stats">
                    <div className="calendar-stat">
                        <span>Total Events</span>
                        {events.length}
                    </div>
                </div>
                <div className="calendar-header-actions">
                    <Tooltip placement="bottom" title="Filter" color={color}>
                        <div className="calendar-header-action">
                            <FilterOutlined />
                        </div>
                    </Tooltip>
                    <Tooltip placement="bottom" title="Calendar" color={color}>
                        <div className="calendar-header-action" onClick={() => navigateTo("/events/calendar")}>
                            <CalendarOutlined />
                        </div>
                    </Tooltip>
                    <Tooltip placement="bottom" title="Create Event" color={color}>
                        <div className="calendar-header-action" onClick={() => navigateTo("/events/create-event")}>
                            <PlusOutlined />
                        </div>
                    </Tooltip>
                    <Tooltip placement="bottom" title="Notifications" color={color}>
                        <div className="calendar-header-action">
                            <GlobalOutlined />
                        </div>
                    </Tooltip>
                </div>
            </div>
            <div className="calendar-content">
                <div>
                    <AntCalendar onPanelChange={onPanelChange} />
                </div>
                <div className="calendar-event-list">
                    {events.map((event: Event) => {
                        return (
                            <div className="calendar-item">
                                <div className="calendar-item-title">{event.name}</div>
                                <div className="calendar-item-title">
                                    <CalendarOutlined />{new Date(event.dateTime.startDate).toLocaleDateString()}
                                </div>
                                <div>
                                    <Button className="view-details" onClick={() => navigateTo(`/events/${event._id}`)}>View event</Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}