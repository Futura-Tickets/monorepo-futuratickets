"use client";
import { useRouter } from "next/navigation";

// ANTD
import Button from "antd/es/button";

// INTERFACES
import { Account, Order, OrderStatus, Sale } from "@/shared/interfaces";

// STYLES
import "./EventOrderItem.scss";

export default function EventOrderItem({ order }: { order: Order }) {

    const router = useRouter();

    const viewOrderDetails = (route: string): void => {
        router.push(route);
    };

    return (
        <div className="event-order-item-container">
            <div className="event-order-item-content">
                <div className="client">{(order.account as unknown as Account).name} {(order.account as unknown as Account).lastName}</div>
                <div className="email">{order.contactDetails.email}</div>
                <div className="tickets">{order.sales.length}</div>
                <div className="amount">{order.sales.reduce((accumulator: number, sale: Sale) => accumulator + sale.price, 0) || 0} EUR</div>
                <div className="status">
                    {order.status == OrderStatus.PENDING && <span className="pending">{order.status}</span>}
                    {order.status == OrderStatus.SUCCEEDED && <span className="succeeded">{order.status}</span>}
                </div>
                <div className="created">{new Date(order.createdAt).toLocaleDateString()}, {new Date(order.createdAt).toLocaleTimeString()}</div>
                <div className="view">
                    <Button className="view-details" onClick={() => viewOrderDetails(`/events/${order.event}/order/${order._id}`)}>View Details</Button>
                </div>
            </div>
        </div>
    );
};