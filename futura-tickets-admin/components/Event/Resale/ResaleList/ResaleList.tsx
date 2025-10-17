"use client";
import { useEffect, useState } from "react";

// COMPONENTS
import ResaleItem from "./ResaleItem/ResaleItem";

// INTERFACES
import { Order, Sale, FilterConfig } from "@/shared/interfaces";

// STYLES
import "./ResaleList.scss";

export default function ResaleList({ resaleList, filterConfig }: { resaleList: Order[], filterConfig: FilterConfig }) {

    const [resaleListState, setResaleState] = useState<Sale[]>([]);
    const [filteredResaleList, setFilteredResaleList] = useState<Sale[]>([]);
    const [fixedPosition, setFixedPosition] = useState<boolean>(false);

    const setEventSalesList = (orders: Order[]): void => {

        const accessTickets: Sale[] = [];

        orders.forEach((order: Order) => {
            order.sales.forEach((sale: Sale) => {
                accessTickets.push({
                    _id: sale._id,
                    event: sale.event,
                    client: sale.client,
                    tokenId: sale.tokenId,
                    hash: sale.hash,
                    type: sale.type,
                    price: sale.price,
                    status: sale.status,
                    qrCode: sale.qrCode,
                    resale: sale.resale,
                    isResale: sale.isResale,
                    isTransfer: sale.isTransfer,
                    createdAt: sale.createdAt
                });
            });
        })

        accessTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setResaleState(accessTickets);

    };

    const applyFilters = (tickets: Sale[]): void => {
        let filtered = [...tickets];

        if (filterConfig.status && filterConfig.status !== '') {
            filtered = filtered.filter(ticket => ticket.status === filterConfig.status);
        }

        if (filterConfig.search && filterConfig.search.trim() !== '') {
            const searchTerm = filterConfig.search.toLowerCase().trim();
            filtered = filtered.filter(ticket => 
                ticket.client.name.toLowerCase().includes(searchTerm) ||
                ticket.client.lastName.toLowerCase().includes(searchTerm) ||
                ticket.client.email.toLowerCase().includes(searchTerm) ||
                ticket.type.toLowerCase().includes(searchTerm) ||
                (ticket.tokenId && ticket.tokenId.toString().includes(searchTerm))
            );
        }

        setFilteredResaleList(filtered);
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
        setEventSalesList(resaleList);
    }, [resaleList]);

    useEffect(() => {
        applyFilters(resaleListState);
    }, [resaleListState, filterConfig]);

    return (
        <div className="resale-list-container">
            <div className="resale-list-header">
                <div className="details">Details</div>
                <div className="token-id">ID</div>
                <div className="client">Client</div>
                <div className="email">Email</div>
                <div className="type">Type</div>
                <div className="price">Resale Price</div>
                <div className="status">Status</div>
                <div className="created">Resale Time</div>
            </div>
            <div className="resale-list-content">
                {filteredResaleList.length == 0 && resaleListState.length == 0 && (
                    <div className="resale-not-found">
                        Tickets not found
                    </div>
                )}
                {filteredResaleList.length == 0 && resaleListState.length > 0 && (
                    <div className="resale-not-found">
                        No tickets match the current filters
                    </div>
                )}
                {filteredResaleList.map((resale: Sale, i: number) => {
                    return <ResaleItem resale={resale} key={i}/>
                })}
            </div>
        </div>
    );
}