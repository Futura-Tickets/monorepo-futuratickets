"use client";
import { useRouter } from "next/navigation";

// STATE
import { useGlobalState } from "@/components/GlobalStateProvider/GlobalStateProvider";

// ANTD
import Button from "antd/es/button";
import { ClockCircleOutlined, FileTextOutlined } from "@ant-design/icons";

// INTERFACES
import { Sale, TicketStatus } from "@/shared/interfaces";

// STYLES
import "./ResaleItem.scss";

export default function ResaleItem({ resale }: { resale: Sale }) {

    const router = useRouter();
    const [state, dispatch] = useGlobalState();

    const viewTicketDetails = (route: string): void => {
        dispatch({ goBackRoute: `/events/${resale.event}/resale` });
        router.push(route);
    };

    return (
        <div className="resale-item-container">
            <div className="resale-item-content">
                <div className="details">
                    <FileTextOutlined onClick={() => viewTicketDetails(`/events/${resale.event}/ticket/${resale._id}`)}/>
                </div>
                <div className="token-id">
                    {resale.tokenId ? `#${resale.tokenId}` : 'N/A'}
                </div>
                <div className="client">
                    {resale.client.name} {resale.client.lastName}
                </div>
                <div className="email">
                    {resale.client.email}
                </div>
                <div className="type">
                    {resale.type}
                </div>
                <div className="price">
                    {resale.status == TicketStatus.TRANSFERED && `${resale.price} EUR`}
                    {(resale.status == TicketStatus.SALE || resale.status == TicketStatus.SOLD) && `${resale.resale?.resalePrice} EUR`}
                </div>
                <div className="status">
                    {resale.status == TicketStatus.SALE && <span className="sale">{resale.status}</span>}
                    {resale.status == TicketStatus.SOLD && <span className="sold">{resale.status}</span>}
                    {resale.status == TicketStatus.TRANSFERED && <span className="transfered">{resale.status}</span>}
                </div>
                <div className="created">
                    <ClockCircleOutlined /> {new Date(resale.createdAt).toLocaleDateString()}, {new Date(resale.createdAt).toLocaleTimeString()}
                </div>
                <div className="view">
                    <Button className="view-details" onClick={() => viewTicketDetails(`/events/${resale.event}/ticket/${resale._id}`)}>View Details</Button>
                </div>
            </div>
        </div>
    );
};