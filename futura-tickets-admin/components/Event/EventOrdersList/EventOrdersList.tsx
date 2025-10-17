"use client";
import { useEffect, useState } from "react";

// ANTD
import { CalendarOutlined } from "@ant-design/icons";

// COMPONENTS
import EventOrderItem from "./EventOrderItem/EventOrderItem";

// INTERFACES
import { Order } from "@/shared/interfaces";

// STYLES
import "./EventOrdersList.scss";

export default function EventOrdersList({ orders }: { orders: Order[]; }) {

    const [eventOrdersList, setEventOrdersState] = useState<Order[]>([]);
   
    const setEventOrdersList = (orders: Order[]): void => {
        setEventOrdersState(orders);
    };

    useEffect(() => {
        setEventOrdersList(orders);
    }, [orders]);

    return (
        <div className="event-orders-list-container">
            <div className="event-orders-list-header">
                <div className="client">Name</div>
                <div className="email">Email</div>
                <div className="tickets">Tickets</div>
                <div className="amount">Amount</div>
                <div className="status">Status</div>
                <div className="created"><CalendarOutlined /> Date</div>
            </div>
            <div className="event-orders-list-content">
                {eventOrdersList.length == 0 && (
                    <div className="event-orders-not-found">
                        Orders not found
                    </div>
                )}
                {eventOrdersList.map((order: Order, i: number) => {
                    return <EventOrderItem order={order} key={i}/>
                })}
            </div>
        </div>
    );
}