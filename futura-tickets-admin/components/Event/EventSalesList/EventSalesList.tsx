"use client";
import { useEffect, useState } from "react";

// ANTD
import { FileOutlined } from "@ant-design/icons";

// COMPONENTS
import EventSaleItem from "./EventSaleItem/EventSaleItem";

// INTERFACES
import { Order, Sale } from "@/shared/interfaces";

// STYLES
import "./EventSalesList.scss";

export default function EventSalesList({ orders }: { orders: Order[] }) {

    const [eventSalesList, setEventSalesState] = useState<Sale[]>([]);

    const setEventSalesList = (orders: Order[]): void => {

        const sales: Sale[] = [];

        orders.forEach((order: Order) => {
            order.sales.forEach((sale: Sale) => {

                sales.push({
                    _id: sale._id,
                    order: sale.order,
                    event: sale.event,
                    client: sale.client,
                    tokenId: sale.tokenId,
                    hash: sale.hash,
                    type: sale.type,
                    price: sale.price,
                    status: sale.status,
                    qrCode: sale.qrCode,
                    isResale: sale.isResale,
                    isTransfer: sale.isTransfer,
                    isInvitation: sale.isInvitation,
                    createdAt: sale.createdAt,
                })
            });
        });

        setEventSalesState(sales);

    };

    useEffect(() => {
        setEventSalesList(orders);
    }, [orders]);

    return (
        <div className="event-sales-list-container">
            <div className="event-sales-list-header">
                <div className="details"><FileOutlined /></div>
                <div className="token-id">ID</div>
                <div className="client">Client</div>
                <div className="email">Email</div>
                <div className="type">Type</div>
                <div className="price">Price</div>
                <div className="status">Status</div>
                <div className="created">Created</div>
            </div>
            <div className="event-sales-list-content">
                {eventSalesList.length == 0 && (
                    <div className="event-sales-not-found">
                        Sales not found
                    </div>
                )}
                {eventSalesList.map((sale: Sale, i: number) => {
                    return <EventSaleItem sale={sale} key={i}/>
                })}
            </div>
        </div>
    );
}