"use client";
import { useRouter } from "next/navigation";

// STATE
import { useGlobalState } from '@/components/GlobalStateProvider/GlobalStateProvider';

// ANTD
import Button from "antd/es/button";
import { ClockCircleOutlined, FileTextOutlined } from "@ant-design/icons";

// INTERFACES
import { AccessHistory, TicketActivity, TicketStatus } from "@/shared/interfaces";

// STYLES
import "./AccessItem.scss";

export default function AccessItem({ access }: { access: AccessHistory }) {

    const router = useRouter();

    const [state, dispatch] = useGlobalState();

    const viewTicketDetails = (route: string): void => {
        dispatch({ goBackRoute: `/events/${access.event}/access` });
        router.push(route);
    };

    return (
        <div className="access-item-container">
            <div className="access-item-content">
                <div className="order">
                    <FileTextOutlined onClick={() => viewTicketDetails(`/events/${access.event}/order/${access.order}`)}/>
                </div>
                <div className="token-id">
                    {access.tokenId ? `#${access.tokenId}` : 'N/A'}
                </div>
                <div className="client">
                    {access.client.name} {access.client.lastName}
                </div>
                <div className="type">
                    {access.type}
                </div>
                <div className="status">
                    {access.activity == TicketActivity.GRANTED && <span className="granted">{access.activity}</span>}
                    {access.activity == TicketActivity.DENIED && <span className="denied">{access.activity}</span>}
                </div>
                <div className="information">
                    {access.reason}
                </div>
                <div className="status">
                    {access.status == TicketStatus.OPEN && <span className="granted">{access.status}</span>}
                    {access.status == TicketStatus.CLOSED && <span className="denied">{access.status}</span>}
                </div>
                <div className="created">
                    <ClockCircleOutlined /> {new Date(access.createdAt).toLocaleDateString()}, {new Date(access.createdAt).toLocaleTimeString()}
                </div>
                <div className="view">
                    <Button className="view-details" onClick={() => viewTicketDetails(`/events/${access.event}/ticket/${access.sale}`)}>View Details</Button>
                </div>
            </div>
        </div>
    );
};