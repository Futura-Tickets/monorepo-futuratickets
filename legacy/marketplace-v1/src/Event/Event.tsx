"use client";
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ANTD
import Button from 'antd/es/button';
import { CalendarOutlined, HomeOutlined, TeamOutlined } from '@ant-design/icons';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// SERVICES
import { getEvent } from '../shared/services';

// INTERFACES
import { Event as IEvent, Ticket } from '../shared/interfaces';

// STYLES
import './Event.scss';

export default function Event() {

    const location = useLocation();

    const navigate = useNavigate();

    const [state, dispatch] = useGlobalState();
    const [loader, setLoader] = useState<boolean>(true);
    const [event, setEventState] = useState<IEvent>();

    const setEvent = async(eventId: string): Promise<void> => {
        try {

            setLoader(true);

            const event = await getEvent(eventId);

            setEventState(event);

            setLoader(false);

        } catch (error) {
            setLoader(false);
        }
    };

    const navigateTo = (route: string): void => {
        navigate(route);
    };

    useEffect(() => {
        location.pathname && setEvent(location.pathname.substring(location.pathname.indexOf('/', 1) + 1, location.pathname.length));
    }, []);

    if (loader) {
        return (
            <div className="event-container loading">
                <div className="event-content">
                    <h1>Loading Event</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="event-container">
            <div className="event-content">
                <div className="event-image">
                    <img src={`${process.env.REACT_APP_BLOB_URL}/${event?.image}`}/>
                </div>
                <div className="event-info-container">
                    <div className="event-info">
                        <div className="event-info-item">
                            <h2>{event?.name}</h2>
                            <p>{event?.description}</p>
                        </div>
                        <div className="event-info-item">
                            <h2>Conditions</h2>
                            <p>{event?.conditions}</p>
                        </div>
                    </div>
                    <div className="event-details">
                        <div className="event-detail">
                            <div className="tickets-num-container">
                                <div className="tickets-num-header">
                                    <h5>Buy Tickets</h5>
                                    <span>({event?.capacity! - event?.nfts.length!} tickets left)</span>
                                </div>
                                {event?.tickets.map((ticket: Ticket, i: number) => {
                                    return <EventType event={event} ticket={ticket} key={i}/>
                                })}
                                <div className="buy-tickets-container">
                                    <Button className="buy-tickets" type="primary" disabled={
                                        (state.cart?.[event!._id].reduce((accumulator, cartEvent: { type: string; amount: number; }) => accumulator + cartEvent.amount, 0) || 0) == 0
                                    } onClick={() => navigateTo('/cart')}>Buy tickets</Button>
                                </div>
                            </div>
                        </div>
                        <div className="event-detail">
                            <h5><CalendarOutlined /> Date</h5>
                            <ul>
                                <li>{new Date(event?.date!).toLocaleDateString()}</li>
                            </ul>
                        </div>
                        <div className="event-detail">
                            <h5><HomeOutlined /> Location</h5>
                            <ul>
                                <li>{event?.location.address},</li>
                                <li>{event?.location.city}, {event?.location.country}</li>
                            </ul>
                        </div>
                        <div className="event-detail">
                            <h5><TeamOutlined /> Capacity</h5>
                            <ul>
                                <li>{event?.capacity} Persons</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>  
    );
};

function EventType({ event, ticket } : { event: IEvent, ticket: Ticket }) {

    const [state, dispatch] = useGlobalState();
    const [ticketsNum, setTicketsNum] = useState<number>(0);

    const addTicket = (event: string, type: string): void => {
        if (state.cart?.[event] == undefined) {
            dispatch({ cart: { ...state.cart, [event]: [{ type, amount: 1 }] }});
        } else {
            dispatch({ cart: {
                ...state.cart,
                [event]: state.cart[event].map((cartEvent: { type: string; amount: number; }) => 
                    cartEvent.type == type ? { type, amount: cartEvent.amount + 1 } : cartEvent
                )}
            });
        }
    };

    const removeTicket = (event: string, type: string): void => {
        dispatch({ cart: {...state.cart, [event]: state.cart?.[event].map((cartEvent: { type: string; amount: number; }) =>
            (cartEvent.type == type && cartEvent.amount > 0) ? { type, amount: cartEvent.amount - 1 } : cartEvent
        )}});
    };

    useEffect(() => {
        setTicketsNum(state.cart?.[event._id].reduce((accumulator, cartEvent: { type: string; amount: number; }) => accumulator + cartEvent.amount, 0) || 0);
    }, [addTicket, removeTicket]);

    return (
        <div className="tickets-num-controller">
            <div className="tickets-num-desc">
                {ticketsNum}
            </div>
            <div>/</div>
            <div className="tickets-num-price">
                {ticket.price} EUR
            </div>
            <div className="tickets-num-actions">
                <Button className="add-ticket" onClick={() => removeTicket(event._id, ticket.type)}>-</Button>
                <Button className="add-ticket" onClick={() => addTicket(event._id, ticket.type)}>+</Button>
            </div>
        </div>
    )
}