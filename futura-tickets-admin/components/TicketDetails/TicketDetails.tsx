"use client";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// STATE
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

// ANTD
import { ClockCircleOutlined, CopyOutlined, FileTextOutlined, HistoryOutlined, InfoCircleOutlined, QrcodeOutlined, RetweetOutlined, UserOutlined } from '@ant-design/icons';
import Tooltip from 'antd/es/tooltip';

// COMPONENTS
import Error from "@/shared/Error/Error";
import GoBack from '@/shared/GoBack/GoBack';
import Loader from '@/shared/Loader/Loader';
import NotificationButton from '../NotificationsMenu/NotificationButton';
import Ticket from './Ticket/Ticket';

// SERVICES
import { getSale, resendEmailOrder } from '@/shared/services';

// UTILS
import { copyToClipboard, parseAddress } from '@/shared/utils/utils';

// INTERFACES
import { Sale, SaleHistory, TicketActivity, TicketStatus } from '@/shared/interfaces';

// STYLES
import './TicketDetails.scss';
import ResendOrderModal from '@/shared/ResendOrderModal/ResendOrderModal';

// CONSTANTS
const SALE_ERROR = "There was an error loading your sale";

const color = '#333333';

export default function TicketDetails() {

    const pathname = usePathname();
    const router = useRouter();
    
    const [state, dispatch] = useGlobalState();
    const [sale, setSale] = useState<Sale>();

    const [resendOrderModalState, setResendOrderModalState] = useState<boolean>(false);
    const [loader, setLoader] = useState<boolean>(true);
    const [error, setError] = useState<boolean>();

    const getTicketDetails = async (saleId: string): Promise<void> => {
        try {

            setLoader(true);

            const sale = await getSale(saleId);
            setSale(sale);

            setLoader(false);
        
        } catch (error) {
            setError(true);
            setLoader(false);
        }
    };

    const copySaleId = (saleId: string): void => {
        copyToClipboard(saleId);
    };

    const viewOrder = (route: string): void => {
        router.push(route);
    };

    const viewClient = (client: string): void => {
        router.push(`/clients/${client}`);
    };

    const revealTransaction = (): void => {
        window.open(`${process.env.NEXT_PUBLIC_BASE_SEPOLIA_SCAN}/nft/${sale?.event.address}/${sale?.tokenId}`, "_blank");
    };

    const resendOrder = async (orderId: string): Promise<void> => {
        try {
            await resendEmailOrder(orderId);
        } catch (error) {
            console.log('error');
        }
    };

    useEffect(() => {
        const saleId = pathname.split("/")[4];
        saleId && getTicketDetails(saleId);
    }, []);

    if (loader) return <Loader/>;
    if (error) return <Error errorMsg={SALE_ERROR}/>;

    return (
        <>
            <div className="ticket-details-container">
                <div className="ticket-details-header">
                    <GoBack route={`/events/${pathname.split("/")[2]}`}/>
                    <div className="ticket-details-id">
                        <h1>{sale?._id}<CopyOutlined className="copy-address" onClick={() => copySaleId(sale?._id!)}/></h1>
                    </div>
                    <div className="event-header-actions">
                        <Tooltip placement="bottom" title="Ticket Order" color={color}>
                            <div className="event-header-action" onClick={() => viewOrder(`/events/${sale?.event._id}/order/${sale?.order as string}`)}>
                                <FileTextOutlined />
                            </div>
                        </Tooltip>
                        <Tooltip placement="bottom" title="Ticket Client" color={color}>
                            <div className="event-header-action" onClick={() => viewClient(sale?.client._id!)}>
                                <UserOutlined />
                            </div>
                        </Tooltip>
                        {sale?.status != 'PENDING' && (
                            <Tooltip placement="bottom" title="Resend Order" color={color}>
                                <div className="event-header-action" onClick={() => setResendOrderModalState(true)}>
                                    <RetweetOutlined />
                                </div>
                            </Tooltip>
                        )}
                        <Tooltip placement="bottom" title="Blockchain Transaction" color={color}>
                            <div className="event-header-action" onClick={() => revealTransaction()}>
                                <QrcodeOutlined />
                            </div>
                        </Tooltip>
                        <NotificationButton />
                    </div>
                </div>
                <div className="ticket-details-content">
                    <Ticket sale={sale!}/>
                    <div>
                        <div className="ticket-details-info-content details">
                            <h2><InfoCircleOutlined /> Ticket Details</h2>
                            <div className="ticket-details-info-content-details">
                                <div className="ticket-details-info">
                                    <div className="ticket-details-item">
                                        <label>Name</label>
                                        <h5>{sale?.client.name} {sale?.client.lastName}</h5>
                                    </div>
                                    <div className="ticket-details-item">
                                        <label>Email</label>
                                        <h5>{sale?.client.email}</h5>
                                    </div>
                                    <div className="ticket-details-item">
                                        <label>Phone</label>
                                        <h5>{sale?.client.phone ? sale?.client.phone : 'N/A'}</h5>
                                    </div>
                                    {/* <div className="ticket-details-item view-transaction">
                                        <Button className="view-details" size="large" onClick={() => viewClient(sale?.client._id!)}>View Client</Button>
                                    </div> */}
                                </div>
                                <div className="ticket-details-info">
                                    <div className="ticket-details-item">
                                        <label>Type</label>
                                        <h5>{sale?.type}</h5>
                                    </div>
                                    <div className="ticket-details-item">
                                        <label>Price</label>
                                        <h5>{sale?.price} EUR</h5>
                                    </div>
                                    {/* <div className="ticket-details-item">
                                        <label>Status</label>
                                        {sale?.status == TicketStatus.PENDING && <h5 className="processing">Pending</h5>}
                                        {sale?.status == TicketStatus.PROCESSING && <h5 className="processing">Processing</h5>}
                                        {sale?.status == TicketStatus.OPEN && <h5 className="minted">Open</h5>}
                                        {sale?.status == TicketStatus.SALE && <h5 className="sale">Sale</h5>}
                                        {sale?.status == TicketStatus.SOLD && <h5 className="sold">Sold</h5>}
                                        {sale?.status == TicketStatus.CLOSED && <h5 className="closed">Closed</h5>}
                                        {sale?.status == TicketStatus.TRANSFERED && <h5 className="transfered">Transfered</h5>}
                                    </div> */}
                                    {sale?.status == TicketStatus.SALE && (
                                        <div className="ticket-details-item">
                                            <label>Resale Price</label>
                                            <h5>{sale.resale?.resalePrice} EUR</h5> 
                                        </div>
                                    )}
                                    <div className="ticket-details-item">
                                        <label>Created</label>
                                        <h5>{new Date(sale?.createdAt!).toLocaleDateString()}</h5>
                                    </div>
                                </div>
                                <div className="ticket-details-info">
                                    <div className="ticket-details-item">
                                        <label>Token ID</label>
                                        <h5>{sale?.tokenId ? `#${sale?.tokenId}`: 'N/A'}</h5>
                                    </div>
                                    <div className="ticket-details-item">
                                        <label>Hash</label>
                                        <h5>{sale?.hash ? parseAddress(sale?.hash) : 'N/A'}</h5>
                                    </div>
                                    <div className="ticket-details-item">
                                        <label>Signature</label>
                                        <h5>{sale?.signature ? parseAddress(sale?.signature) : 'N/A'}</h5>
                                    </div>
                                    {/* <div className="ticket-details-item view-transaction">
                                        {sale?.tokenId && sale?.hash && <Button className="view-details" size="large" onClick={() => revealTransaction()}>View Transaction</Button>}
                                    </div> */}
                                </div>
                            </div>
                        </div>
                        <div className="ticket-details-info-content">
                            <h2><HistoryOutlined /> Ticket Activity</h2>
                            <div className="ticket-history">
                                <div className="ticket-history-header">
                                    <div className="activity">Activity</div>
                                    <div className="information">Information</div>
                                    <div className="status">Status</div>
                                    <div className="date">Date</div>
                                </div>
                                {sale?.history?.map((saleHistory: SaleHistory, i: number) => {
                                    return (
                                        <div className="ticket-history-item" key={i}>
                                            <div className="activity">
                                                {saleHistory.activity == TicketActivity.PENDING && <span className="pending">{saleHistory.activity}</span>}
                                                {saleHistory.activity == TicketActivity.PROCESSING && <span className="processing">{saleHistory.activity}</span>}
                                                {saleHistory.activity == TicketActivity.PROCESSED && <span className="processed">{saleHistory.activity}</span>}
                                                {saleHistory.activity == TicketActivity.GRANTED && <span className="granted">{saleHistory.activity}</span>}
                                                {saleHistory.activity == TicketActivity.DENIED && <span className="closed">{saleHistory.activity}</span>}
                                                {saleHistory.activity == TicketActivity.TRANSFERING && <span className="transfering">{saleHistory.activity}</span>}
                                                {saleHistory.activity == TicketActivity.TRANSFERED && <span className="transfered">{saleHistory.activity}</span>}
                                            </div>
                                            <div className="information">
                                                {saleHistory.reason ? saleHistory.reason : 'N/A'}
                                            </div>
                                            <div className="status">
                                                {saleHistory?.status == TicketStatus.PENDING && <span className="processing">Pending</span>}
                                                {saleHistory?.status == TicketStatus.PROCESSING && <span className="processing">Processing</span>}
                                                {saleHistory?.status == TicketStatus.TRANSFERED && <span className="transfered">Transfered</span>}
                                                {saleHistory?.status == TicketStatus.OPEN && <span className="open">Open</span>}
                                                {saleHistory?.status == TicketStatus.SALE && <span className="sale">Sale</span>}
                                                {saleHistory?.status == TicketStatus.SOLD && <span className="sold">Sold</span>}
                                                {saleHistory?.status == TicketStatus.CLOSED && <span className="closed">Closed</span>}
                                            </div>
                                            <div className="date"><ClockCircleOutlined /> {new Date(saleHistory.createdAt).toLocaleDateString()}, {new Date(saleHistory.createdAt).toLocaleTimeString()}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ResendOrderModal orderId={sale?.order!} resendOrderModal={resendOrderModalState} setResendOrderModal={setResendOrderModalState}/>
        </>
    );

};