"use client";
import { useEffect, useState } from "react";

// ANTD
import { FileOutlined } from "@ant-design/icons";

// COMPONENTS
import UserSaleItem from "./UserSaleItem/UserSaleItem";

// INTERFACES
import { Order, Sale } from "@/shared/interfaces";

// STYLES
import "./UserSalesList.scss";

export default function UserSalesList({ orders }: { orders: Order[] }) {

    const [eventSalesList, setEventSalesState] = useState<Sale[]>([]);
    const [fixedPosition, setFixedPosition] = useState<boolean>(false);

    const setUserSalesList = (orders: Order[]): void => {

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
                    createdAt: sale.createdAt
                })
            });
        });

        setEventSalesState(sales);

    };

    const detectHeaderPosition = (): void  => {
        window.addEventListener('scroll', (event: any) => {
            if (window.scrollY >= 410) {
                setFixedPosition(true);
            } else {
                setFixedPosition(false);
            }
        });
    };

    useEffect(() => {
        setUserSalesList(orders);
    }, [orders]);

    return (
        <div className="user-sales-list-container">
            <div className="user-sales-list-header">
                <div className="details"><FileOutlined /></div>
                <div className="token-id">ID</div>
                <div className="event">Event</div>
                <div className="type">Type</div>
                <div className="price">Price</div>
                <div className="status">Status</div>
                <div className="created">Created</div>
            </div>
            <div className="user-sales-list-content">
                {eventSalesList.map((sale: Sale, i: number) => {
                    return <UserSaleItem sale={sale} key={i}/>
                })}
            </div>
        </div>
    );
}