"use client";
import { useEffect, useState } from "react";
import { FileOutlined } from "@ant-design/icons";

// COMPONENTS
import OrderSaleItem from "./OrderSaleItem/OrderSaleItem";

// INTERFACES
import { Sale } from "@/shared/interfaces";

// STYLES
import "./OrderSalesList.scss";

export default function OrderSalesList({ sales }: { sales: Sale[] }) {

    const [orderSalesList, setOrderSalesState] = useState<Sale[]>([]);

    const setOrderSalesList = (sales: Sale[]): void => {

        const orderSales: Sale[] = [];

        sales.forEach((sale: Sale) => {
            orderSales.push({
                _id: sale._id,
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

        setOrderSalesState(sales);

    };

    useEffect(() => {
        setOrderSalesList(sales);
    }, [sales]);

    return (
        <div className="order-sales-list-container">
            <div className="order-sales-list-header">
                <div className="details"><FileOutlined /></div>
                <div className="token-id">ID</div>
                <div className="client">Client</div>
                <div className="email">Email</div>
                <div className="type">Type</div>
                <div className="price">Price</div>
                <div className="status">Status</div>
                <div className="created">Created</div>
            </div>
            <div className="order-sales-list-content">
                {orderSalesList.map((sale: Sale, i: number) => {
                    return <OrderSaleItem sale={sale} key={i}/>
                })}
            </div>
        </div>
    );
}