"use client";
import { useRouter } from "next/navigation";

// STATE
import { useGlobalState } from "@/components/GlobalStateProvider/GlobalStateProvider";

// ANTD
import Button from "antd/es/button";
import { ClockCircleOutlined, FileTextOutlined, SendOutlined, SwapOutlined } from "@ant-design/icons";

// INTERFACES
import { Sale, TicketStatus } from "@/shared/interfaces";

// STYLES
import "./UserSaleItem.scss";

export default function UserSaleItem({ sale }: { sale: Sale }) {

    const router = useRouter();
    const [state, dispatch] = useGlobalState();

    const viewTicketDetails = (route: string): void => {
        dispatch({ goBackRoute: `/clients/${sale.client}` });
        router.push(route);
    };

    return (
        <div className="user-sale-item-container">
            <div className="user-sale-item-content">
                <div className="details">
                    {sale.isResale && <SwapOutlined onClick={() => viewTicketDetails(`/events/${sale.event._id}/order/${sale.order}`)}/>}
                    {sale.isTransfer && <SendOutlined onClick={() => viewTicketDetails(`/events/${sale.event._id}/order/${sale.order}`)}/>}
                    {(!sale.isResale && !sale.isTransfer) && <FileTextOutlined onClick={() => viewTicketDetails(`/events/${sale.event._id}/order/${sale.order}`)}/>}
                </div>
                <div className="token-id">
                    {sale.tokenId ? `#${sale.tokenId}` : `N/A`}
                </div>
                <div className="event">
                    {sale.event.name}
                </div>
                <div className="type">
                    {sale.type}
                </div>
                <div className="price">
                    {sale.price} EUR
                </div>
                <div className="status">
                    {sale.status == TicketStatus.PENDING && <span className="pending">{sale.status}</span>}
                    {sale.status == TicketStatus.OPEN && <span className="minted">{sale.status}</span>}
                    {sale.status == TicketStatus.SALE && <span className="sale">{sale.status}</span>}
                    {(sale.status == TicketStatus.CLOSED || sale.status == TicketStatus.EXPIRED) && <span className="closed">{sale.status}</span>}
                    {sale.status == TicketStatus.SOLD && <span className="sold">{sale.status}</span>}
                    {sale.status == TicketStatus.TRANSFERED && <span className="transfered">{sale.status}</span>}
                    {sale.status == TicketStatus.PROCESSING && <span className="processing">{sale.status}</span>}
                </div>
                <div className="created">
                    <ClockCircleOutlined /> {new Date(sale.createdAt).toLocaleDateString()}, {new Date(sale.createdAt).toLocaleTimeString()}
                </div>
                <div className="view">
                    <Button className="view-details" onClick={() => viewTicketDetails(`/events/${sale.event._id}/ticket/${sale._id}`)}>View Details</Button>
                </div>
            </div>
        </div>
    );
};