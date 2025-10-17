"use client";
import { useEffect, useState } from 'react';

// ANTD
import { CalendarOutlined, ClockCircleOutlined, HomeOutlined, SwapOutlined, TeamOutlined } from '@ant-design/icons';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// COMPONENTS
import ResaleList from './ResaleList/ResaleList';

// SERVICES
import { getEventResale } from '../shared/services';

// INTERFACES
import { Sale } from '../shared/interfaces';

// STYLES
import './Resale.scss';

export default function Resale() {

    const [state, dispatch] = useGlobalState();
    const [eventResale, setEventResale] = useState<Sale[]>([]);
    const [loader, setLoader] = useState<boolean>(false);

    const setResale = async (eventId: string): Promise<void> => {
        try {

            setLoader(true);

            const eventResale = await getEventResale(eventId);
            setEventResale(eventResale);

            setLoader(false);

        } catch (error) {
            setLoader(false);
        }
    };

    useEffect(() => {
        setResale(process.env.NEXT_PUBLIC_EVENT_ID!);
    }, []);

    if (loader) {
        <div className="resale-container">
            <div className="resale-content">
                <div className="resale-image-container">
                    <div className="resale-image" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BLOB_URL}/${state.event?.image})` }}></div>
                    <img src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${state.event?.image}`}/>
                </div>
                <div className="resale-info-container">
                    Loading ...
                </div>
            </div>
        </div>
    }

    return (
        <div className="resale-container">
            <div className="resale-content">
                <div className="resale-image-container">
                    <div className="resale-image" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BLOB_URL}/${state.event?.image})` }}></div>
                </div>
                <div className="resale-info-container">
                    <div>&nbsp;</div>
                    <div className="resale-info">
                        <div className="resale-info-item">
                            <h2>Ticket Resale</h2>
                            <ResaleList eventResale={eventResale}/>
                        </div>
                    </div>
                    <div className="event-details">
                        <div className="event-detail">
                            <h5><CalendarOutlined /> Start Date</h5>
                            <ul>
                                <li>{new Date(state.event?.dateTime.startDate!).toLocaleDateString()}</li>
                            </ul>
                        </div>
                        <div className="event-detail">
                            <h5><ClockCircleOutlined /> Start Time</h5>
                            <ul>
                                <li>{new Date(state.event?.dateTime.startTime!).toLocaleTimeString()}</li>
                            </ul>
                        </div>
                        <div className="event-detail">
                            <h5><HomeOutlined /> Location</h5>
                            <ul>
                                <li>{state.event?.location.address},</li>
                                <li>{state.event?.location.city}, {state.event?.location.country}</li>
                            </ul>
                        </div>
                        {/* <div className="event-detail">
                            <h5><TeamOutlined /> Capacity</h5>
                            <ul>
                                <li>{state.event?.capacity} Persons</li>
                            </ul>
                        </div> */}
                    </div>
                </div>
            </div>
        </div> 
    );
}