"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// GOOGLE MAPS
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

// ANTD
import Button from 'antd/es/button';
import { CalendarOutlined, ClockCircleOutlined, HomeOutlined, TagsOutlined, TeamOutlined } from '@ant-design/icons';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// UTILS
import { formatTwoDigits } from '../shared/utils';

// INTERFACES
import { Artist, Item, Ticket } from '../shared/interfaces';

// STYLES
import './Event.scss';

export default function Event() {

    const router = useRouter();

    const [state, dispatch] = useGlobalState();

    const navigateTo = (route: string): void => {
        router.push(route);
    };

    return (
        <div className="event-container">
            <div className="event-content">
                <div className="event-image-container">
                    <div className="event-image" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BLOB_URL}/${state.event?.image})` }}>
                        <div className="event-image-info">
                            <h1>{state.event?.name}</h1>
                            <h2>{new Date(state.event?.dateTime.startDate!).toLocaleDateString()}</h2>
                            <h2>{state.event?.location.city}, {state.event?.location.country}</h2>

                        </div>
                    </div>
                </div>
                <div className="event-info-container">
                    <div className="event-details artists">
                        {state.event!.artists.length > 0 && (
                            <div className="event-detail">
                                <h5>Artists ({state.event?.artists.length})</h5>
                                <ul className="artists-list">
                                    {state.event?.artists.map((artist: Artist) => {
                                        return (
                                            <li className="artist-item">
                                                <img src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${artist.image}`}/>{artist.name}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="event-info">
                        <div className="event-info-item">
                            <h1>{state.event?.name}</h1>
                            <p>{state.event?.description}</p>
                        </div>
                        <div className="event-info-item">
                            <h2>Conditions</h2>
                            {state.event?.conditions.map((condition, index) => (
                                <div key={index}>
                                    {condition.title && <h3>{condition.title}</h3>}
                                    {condition.description && <p>{condition.description}</p>}
                                </div>
                            ))}
                        </div>
                        <div className="event-info-item">
                            <h2>FAQs</h2>
                            {state.event?.faqs.map((faq, index) => (
                                <div key={index}>
                                    {faq.title && <h3>{faq.title}</h3>}
                                    {faq.description && <p>{faq.description}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="event-details">
                        <div className="event-detail">
                            <div className="tickets-num-container">
                                <div className="tickets-num-header">
                                    <h5><TagsOutlined /> Buy Tickets</h5>
                                    {/* <span>({state.event?.capacity! - state.event?.nfts.length!} tickets left)</span> */}
                                </div>
                                {state.event?.tickets.map((ticket: Ticket, i: number) => {
                                    return <EventType ticket={ticket} key={i}/>
                                })}
                                <div className="buy-tickets-container">
                                    <Button className="buy-tickets" type="primary" size="large" disabled={
                                        (state.items?.reduce((accumulator, item: Item) => accumulator + item.amount, 0) || 0) == 0
                                    } onClick={() => navigateTo('/cart')}>Buy tickets</Button>
                                </div>
                            </div>
                        </div>
                        <div className="event-detail">
                            <h5><CalendarOutlined /> Start Date</h5>
                            <ul>
                                <li>{new Date(state.event?.dateTime.startDate!).toLocaleDateString()}</li>
                            </ul>
                        </div>
                        <div className="event-detail">
                            <h5><ClockCircleOutlined /> Start Time</h5>
                            <ul>
                                <li>{formatTwoDigits(new Date(state.event?.dateTime.startDate!).getHours())}:{formatTwoDigits(new Date(state.event?.dateTime.startTime!).getMinutes())}</li>
                            </ul>
                        </div>
                        {/* 
                        <div className="event-time-date">
                            <div className="time-date-container">
                                <div className="time-date-content">
                                    <label><CalendarOutlined /> Start Date</label>
                                    <span>{new Date(state.event?.dateTime.startDate!).toLocaleDateString()}</span>
                                </div>
                                <div className="time-date-content">
                                    <label><ClockCircleOutlined /> Start Time</label>
                                    <span>{new Date(state.event?.dateTime.startTime!).toLocaleTimeString()}</span>
                                </div>
                            </div>
                            <div className="time-date-container">
                                <div className="time-date-content">
                                    <label><CalendarOutlined /> End Date</label>
                                        <span>{new Date(state.event?.dateTime.endDate!).toLocaleDateString()}</span>
                                    </div>
                                <div className="time-date-content">
                                    <label><ClockCircleOutlined /> End Time</label>
                                    <span>{new Date(state.event?.dateTime.endTime!).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                        */}
                        <div className="event-detail">
                            <h5><HomeOutlined /> Location</h5>
                            <ul>
                                <li>{state.event?.location.address},</li>
                                <li>{state.event?.location.city}, {state.event?.location.country}</li>
                            </ul>
                        </div>
                        <div className="event-detail">
                            <h5><TeamOutlined /> Capacity</h5>
                            <ul>
                                <li>{state.event?.capacity} Persons</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <APIProvider apiKey={"AIzaSyAE8e0TcqyrC4IxUl9iA1kdJFCFgH92bio"}>
                <Map
                    style={{width: '100%', height: '420px'}}
                    disableDefaultUI={true}
                    defaultCenter={{lat: 39.462769, lng: -0.3283217}}
                    defaultZoom={15}
                >
                    <Marker position={{lat: 39.462769, lng: -0.3283217}} />
                </Map>
            </APIProvider>
            
        </div>  
    );
};

function EventType({ ticket } : { ticket: Ticket }) {

    const [state, dispatch] = useGlobalState();
    const [ticketsNum, setTicketsNum] = useState<number>(0);

    const addTicket = (type: string, price: number): void => {
        if (state.items?.filter((item: Item) => item.type == type).length == 0) {
            dispatch({ items: [...state.items, { type, amount: 1, price }] });
        } else {
            dispatch({ items: state.items.map((item: Item) => item.type == type ? { type, amount: item.amount + 1, price } : item )});
        }
    };

    const totalTickets = (): number => {
        return (state.items?.reduce((accumulator, item: Item) => accumulator + item.amount, 0) || 0) + (state.resaleItems?.reduce((accumulator, item: Item) => accumulator + item.amount, 0) || 0);
    };

    const removeTicket = (type: string): void => {
        dispatch({ items: state.items?.filter((item: Item) => item.type != type || (item.type == type && item.amount > 1)).map((item: Item) => (item.type == type && item.amount > 1) ? { type, price: item.price, amount: item.amount - 1 } : item )});
    };

    useEffect(() => {
        setTicketsNum(state.items.filter((item: Item) => item.type == ticket.type).reduce((accumulator, item: Item) => accumulator + item.amount, 0) || 0);
    }, [addTicket, removeTicket]);

    return (
        <div className="tickets-num-controller-container">
            <div className="tickets-num-controller-header">
                <h5>{ticket.type}</h5>
            </div>
            <div className="tickets-num-controller">
                <div className="tickets-num-amount">
                    <div className="tickets-num-desc">
                        {ticketsNum}
                    </div>
                    <div className="tickets-num-space">/</div>
                    <div className="tickets-num-price">
                        {ticket.price} EUR
                    </div>
                </div>
                <div className="tickets-num-actions">
                    <Button className="add-ticket" onClick={() => removeTicket(ticket.type)}>-</Button>
                    <Button className="add-ticket" onClick={() => addTicket(ticket.type, ticket.price)} disabled={totalTickets() >= state.event!.maxQuantity}>+</Button>
                </div>
            </div>
        </div>
    );
}