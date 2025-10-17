"use client";

// ANTD
import { CalendarOutlined, ClockCircleOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';

// INTERFACES
import { Sale, TicketStatus } from '@/shared/interfaces';

// STYLES
import './Ticket.scss';

export default function Ticket({ sale }: { sale: Sale }) {
    return (
        <div className="ticket-item-container">
            <div className="ticket-item-image" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BLOB_URL}/${sale.event?.ticketImage})` }}>
                <div className="ticket-qr">
                    {(sale.status == TicketStatus.OPEN || sale.status == TicketStatus.SALE) && <img src={sale.qrCode}/>}
                    {sale.status == TicketStatus.PROCESSING && <LoadingOutlined />}
                    {sale.status == TicketStatus.SOLD && <CloseOutlined />}
                    {(sale.status == TicketStatus.CLOSED || sale.status == TicketStatus.EXPIRED) && <CloseOutlined />}
                    {sale.status == TicketStatus.PENDING && <CloseOutlined />}
                    {sale.status == TicketStatus.TRANSFERED && <CloseOutlined />}
                </div>
            </div>
            <div className="ticket-item-content">
                <h5>{sale.event.name}</h5>
                <div className="ticket-date-time">
                    <div><CalendarOutlined /> {new Date(sale.event?.dateTime?.startDate!).toLocaleDateString()}</div>
                    <div><ClockCircleOutlined /> {new Date(sale.event?.dateTime?.startDate!).toLocaleTimeString()}</div>
                </div>
                <div className="ticket-status">
                    {sale.status == TicketStatus.OPEN && <div className="open">{sale.status}</div>}
                    {(sale.status == TicketStatus.CLOSED || sale.status == TicketStatus.EXPIRED) && <div className="closed">{sale.status}</div>}
                    {sale.status == TicketStatus.SALE && <div className="sale">{sale.status}</div>}
                    {sale.status == TicketStatus.SOLD && <div className="sold">{sale.status}</div>}
                    {(sale.status == TicketStatus.PENDING || sale.status == TicketStatus.PROCESSING) && <div className="pending">{sale.status}</div>}
                    {sale.status == TicketStatus.TRANSFERED && <div className="transfered">{sale.status}</div>}
                </div>
                <div className="ticket-type">
                    <div className="regular">{sale.type}</div>
                </div>
            </div>
        </div>
    )
}