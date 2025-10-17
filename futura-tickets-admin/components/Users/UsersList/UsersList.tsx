"use client";
import { useRouter } from 'next/navigation';

// ANTD
import Button from "antd/es/button";
import { ClockCircleOutlined } from '@ant-design/icons';

// INTERACES
import { Order, PromoterClient, Sale } from "@/shared/interfaces";

// STYLES
import "./UsersList.scss";

export function UserItem({ promoterClient }: { promoterClient: PromoterClient }) {

    const router = useRouter();

    const navigateTo = (route: string): void => {
        router.push(route);
    };

    const calculateTotalEvents = (orders: Order[]): number => {
        const events: string[] = [];
        orders.forEach((order: Order) => {
            let found = false;
            events.forEach((event: string) => {
                if (order.event == event) found = true;
            });
            if (!found) events.push(order.event);
        });
        return events.length;
    };

    const calculateTotalAmount = (orders: Order[]): number => {
        return orders.reduce((accumulator: number, order: Order) => accumulator + order.sales.reduce((accumulator: number, sale: Sale) => accumulator + sale.price, 0), 0) || 0;
    };

    return (
        <div className="user-item-container">
            <div className="user-item-content">
                <div className="user-item-name">{promoterClient.client.name} {promoterClient.client.lastName}</div>
                <div className="user-item-address">{promoterClient.client.email}</div>
                <div className="amount">{calculateTotalEvents(promoterClient.client.orders)}</div>
                <div className="amount">{promoterClient.client.orders?.length}</div>
                <div className="amount">{promoterClient.client.orders.reduce((accumulator: number, order: Order) => accumulator + order.sales.length, 0) || 0}</div>
                <div className="total-amount">{calculateTotalAmount(promoterClient.client.orders || [])} EUR</div>
                <div className="user-item-date"><ClockCircleOutlined /> {new Date(promoterClient.createdAt).toLocaleDateString()}</div>
                <div className="user-item-action">
                    <Button className="view-details" onClick={() => navigateTo(`/clients/${promoterClient.client._id}`)}>View client</Button>
                </div>
            </div>
        </div>
    )
}

export default function UsersList({ promoterClients }: { promoterClients: PromoterClient[]}) {
    return (
        <div className="users-list-container">
            <div className="users-list-header">
                <div className="user-item-name">Name</div>
                <div className="user-item-address">Email</div>
                <div className="amount">Events</div>
                <div className="amount">Orders</div>
                <div className="amount">Tickets</div>
                <div className="total-amount">Total Amount</div>
                <div className="user-item-date">Created</div>
            </div>
            <div className="users-list-content">
                {(!promoterClients || promoterClients.length === 0) && (
                    <div className="users-not-found">
                        Clients not found
                    </div>
                )}
                {Array.isArray(promoterClients) && promoterClients.map((promoterClient: PromoterClient, i: number) => {
                    return <UserItem promoterClient={promoterClient} key={i}/>
                })}
            </div>
        </div>
    );
}