"use client";
import { useRouter } from "next/navigation";

// ANTD
import Button from "antd/es/button";
import { ClockCircleOutlined, FileTextOutlined, LoadingOutlined, MailOutlined, SendOutlined, SwapOutlined } from "@ant-design/icons";

// INTERFACES
import { Sale, TicketStatus } from "@/shared/interfaces";

// STYLES
import "./EventSaleItem.scss";

export default function EventSaleItem({ sale }: { sale: Sale }) {

    const router = useRouter();

    const viewTicketDetails = (route: string): void => {
        router.push(route);
    };

    return (
        <div className="event-sale-item-container">
            <div className="event-sale-item-content">
                <div className="details">
                    {sale.isInvitation && <MailOutlined onClick={() => viewTicketDetails(`/events/${sale.event}/order/${sale.order}`)}/>}
                    {sale.isResale && <SwapOutlined onClick={() => viewTicketDetails(`/events/${sale.event}/order/${sale.order}`)}/>}
                    {sale.isTransfer && <SendOutlined onClick={() => viewTicketDetails(`/events/${sale.event}/order/${sale.order}`)}/>}
                    {(!sale.isResale && !sale.isTransfer && !sale.isInvitation) && <FileTextOutlined onClick={() => viewTicketDetails(`/events/${sale.event}/order/${sale.order}`)}/>}
                </div>
                <div className="token-id">
                    {sale.tokenId ? `#${sale.tokenId}` : 'N/A'}
                </div>
                <div className="client">
                    {sale.client.name} {sale.client.lastName}
                </div>
                <div className="email">
                    {sale.client.email}
                </div>
                <div className="type">
                    {sale.type}
                </div>
                <div className="price">
                    {sale.price} EUR
                </div>
                <div className="status">
                    {sale.status == TicketStatus.CLOSED && <span className="closed">{sale.status}</span>}
                    {sale.status == TicketStatus.EXPIRED && <span className="closed">{sale.status}</span>}
                    {sale.status == TicketStatus.OPEN && <span className="minted">{sale.status}</span>}
                    {sale.status == TicketStatus.SALE && <span className="sale">{sale.status}</span>}
                    {sale.status == TicketStatus.SOLD && <span className="sold">{sale.status}</span>}
                    {sale.status == TicketStatus.PENDING && <span className="pending">{sale.status}</span>}
                    {sale.status == TicketStatus.TRANSFERED && <span className="transfered">{sale.status}</span>}
                    {sale.status == TicketStatus.PROCESSING && <span className="processing">{sale.status}<LoadingOutlined /></span>}
                </div>
                <div className="created">
                    <ClockCircleOutlined /> {new Date(sale.createdAt).toLocaleDateString()}, {new Date(sale.createdAt).toLocaleTimeString()}
                </div>
                <div className="view">
                    <Button className="view-details" onClick={() => viewTicketDetails(`/events/${sale.event}/ticket/${sale._id}`)}>View Details</Button>
                </div>
            </div>
        </div>
    );
};