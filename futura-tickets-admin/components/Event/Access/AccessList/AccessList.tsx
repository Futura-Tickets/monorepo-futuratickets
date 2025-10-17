"use client";
import { useEffect, useState } from "react";

// ANTD
import { FileOutlined } from "@ant-design/icons";

// COMPONENTS
import AccessItem from "./AccessItem/AccessItem";

// INTERFACES
import { AccessHistory, Sale, SaleHistory, TicketActivity } from "@/shared/interfaces";

// STYLES
import "./AccessList.scss";

export default function AccessList({ eventAccessList }: { eventAccessList: Sale[] }) {

    const [eventAccessListState, setEventAccessState] = useState<AccessHistory[]>([]);
    const [fixedPosition, setFixedPosition] = useState<boolean>(false);

    const setEventSalesList = (sales: Sale[]): void => {

        const accessTickets: AccessHistory[] = [];

        sales.forEach((sale: Sale) => {
            sale.history?.forEach((saleHistory: SaleHistory) => {
                if (saleHistory.activity == TicketActivity.GRANTED || saleHistory.activity == TicketActivity.DENIED) {
                    accessTickets.push({
                        sale: sale._id,
                        event: sale.event as unknown as string,
                        order: sale.order!,
                        client: {
                            name: sale.client.name,
                            lastName: sale.client.lastName,
                            email: sale.client.email
                        },
                        tokenId: sale.tokenId!,
                        activity: saleHistory.activity,
                        reason: saleHistory.reason,
                        type: sale.type,
                        price: sale.price,
                        status: saleHistory.status,
                        createdAt: saleHistory.createdAt
                    });
                }
            });
        });

        accessTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setEventAccessState(accessTickets);

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
        setEventSalesList(eventAccessList);
    }, [eventAccessList]);

    return (
        <div className="access-list-container">
            <div className="access-list-header">
                <div className="order">
                    <FileOutlined />
                </div>
                <div className="token-id">ID</div>
                <div className="client">Client</div>
                <div className="type">Type</div>
                <div className="status">Activity</div>
                <div className="information">Information</div>
                <div className="status">Status</div>
                <div className="created">Access Time</div>
            </div>
            <div className="access-list-content">
                {eventAccessListState.length == 0 && (
                    <div className="access-not-found">Tickets not found</div>
                )}
                {eventAccessListState.map((access: AccessHistory, i: number) => {
                    return <AccessItem access={access} key={i}/>
                })}
            </div>
        </div>
    );
}