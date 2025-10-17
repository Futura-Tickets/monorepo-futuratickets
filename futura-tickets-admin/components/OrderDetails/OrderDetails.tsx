"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// ANTD
import { CopyOutlined, EuroCircleOutlined, RetweetOutlined, TagsOutlined } from '@ant-design/icons';

// COMPONENTS
import Error from "@/shared/Error/Error";
import GoBack from '@/shared/GoBack/GoBack';
import Loader from '@/shared/Loader/Loader';
import PieChart from '@/shared/PieChart/PieChart';
import NotificationButton from '../NotificationsMenu/NotificationButton';
import ResendOrderModal from '@/shared/ResendOrderModal/ResendOrderModal';
import OrderSalesList from './OrderSalesList/OrderSalesList';

// SERVICES
import { getOrder } from '@/shared/services';

// UTILS
import { copyToClipboard } from '@/shared/utils/utils';

// INTERFACES
import { Account, Order, OrderStatus, Sale, TicketStatus } from '@/shared/interfaces';

// STYLES
import './OrderDetails.scss';
import Tooltip from 'antd/es/tooltip';

// CONSTANTS
const SALE_ERROR = "There was an error loading your order";

const initialStatusPieChartData = [
    ["Ticket Status", "Amount"],
    ["Pending", 0],
    ["Open", 0],
    ["Sale", 0],
    ["Sold", 0],
    ["Closed", 0],
    ["Expired", 0],
    ["Transfered", 0]
];

const initialTypePieChartData = [
    ["Ticket Types", "Amount"],
    ["", 0]
];

const statusPieOptions = {
    title: "STATUS",
    titleTextStyle: {
        color: '#333333',
        fontSize: 11,
        bold: true
    },
    legend: { position: 'none' },
    colors: ['#e4e4e4', '#049b92', '#006f94', '#e4e4e4', '#fe5456', '#fe5456', '#e4e4e4']
};

const typePieOptions = {
    title: "TYPES",
    titleTextStyle: {
        color: '#333333',
        fontSize: 11,
        bold: true
    },
    legend: { position: 'none' },
    colors: ['#049b92', '#04af92', '#04c392', '#04d792', '#04eb92', '#04eb92', '#04ff92']
};

const color = '#333333';

export default function OrderDetails() {

    const pathname = usePathname();

    const [order, setOrder] = useState<Order>();
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [statusPieChartData, setStatusPieChartData] = useState<any[]>(initialStatusPieChartData);
    const [typePieChartData, setTypePieChartData] = useState<any[]>(initialTypePieChartData);

    const [resendOrderModalState, setResendOrderModalState] = useState<boolean>(false);
    const [loader, setLoader] = useState<boolean>(true);
    const [error, setError] = useState<boolean>();

    const getOrderDetails = async (orderId: string): Promise<void> => {
        try {

            setLoader(true);

            const order = await getOrder(orderId);
            setOrder(order);

            setLoader(false);
        
        } catch (error) {
            setError(true);
            setLoader(false);
        }
    };

    const copySaleId = (saleId: string): void => {
        copyToClipboard(saleId);
    };

    const calculateChartData = (sales: Sale[]) => {

        let totalRevenue = 0;
        let pendingTickets = 0;
        let openTickets = 0;
        let saleTickets = 0;
        let soldTickets = 0;
        let transferedTickets = 0;
        let closedTickets = 0;
        let expiredTickets = 0;

        let types: [string, number][] = [];

        sales.forEach((sale: Sale) => {

            const foundType = types.find((type: [string, number]) => type[0] == sale.type);
            if (!foundType) {
                types.push([sale.type, 1]);
            } else {
                types = types.map((type: [string, number]) => type[0] == sale.type ? [type[0], type[1] + 1] : type);
            }

            if (sale.status == TicketStatus.PENDING) pendingTickets += 1;
            if (sale.status == TicketStatus.SOLD) soldTickets += 1;
            if (sale.status == TicketStatus.TRANSFERED) transferedTickets += 1;

            if (sale.status == TicketStatus.OPEN) {
                openTickets += 1;
                totalRevenue += sale.price;
            }
            
            if (sale.status == TicketStatus.SALE) {
                saleTickets += 1;
                totalRevenue += sale.price;
            }

            if (sale.status == TicketStatus.CLOSED) {
                closedTickets += 1;
                totalRevenue += sale.price;
            }

            if (sale.status == TicketStatus.EXPIRED) {
                expiredTickets += 1;
                totalRevenue += sale.price;
            }

        });

        setTotalAmount(totalRevenue);

        const statusPieChartData = [
            ["Ticket Status", "Amount"],
            ["Pending", pendingTickets],
            ["Open", openTickets],
            ["Sale", saleTickets],
            ["Sold", soldTickets],
            ["Closed", closedTickets],
            ["Expired", expiredTickets],
            ["Transfered", transferedTickets]
        ];

        const typePieChartData = [
            ["Ticket Types", "Amount"],
            ...types
        ];

        setStatusPieChartData(statusPieChartData);
        setTypePieChartData(typePieChartData);

    }; 

    useEffect(() => {
        const orderId = pathname.split("/")[4];
        orderId && getOrderDetails(orderId);
    }, []);

    useEffect(() => {
        order && calculateChartData(order.sales);
    }, [order]);

    if (loader) return <Loader/>;
    if (error) return <Error errorMsg={SALE_ERROR}/>;

    return (
        <>
            <div className="order-details-container">
                <div className="order-details-header">
                    <GoBack route={`/events/${pathname.split("/")[2]}`}/>
                    <div className="order-details-id">
                        <h1>{order?._id}<CopyOutlined className="copy-address" onClick={() => copySaleId(order?._id!)}/></h1>
                    </div>
                    <div className="order-details-header-actions">
                        {order?.status == 'SUCCEEDED' && (
                            <Tooltip placement="bottom" title="Resend Order" color={color}>
                                <div className="order-details-header-action" onClick={() => setResendOrderModalState(true)}>
                                    <RetweetOutlined />
                                </div>
                            </Tooltip>
                        )}
                        <NotificationButton />
                    </div>
                </div>
                <div className="order-stats">
                    <div className="order-stat">
                        <span>Total Tickets <TagsOutlined /></span>
                        {order?.sales.length}
                    </div>
                    <div className="order-stat">
                        <span>Total Amount <EuroCircleOutlined /></span>
                        {totalAmount} EUR
                    </div>
                    <div className="order-stat">
                        <span>Status <EuroCircleOutlined /></span>
                        {order?.status}
                    </div>
                </div>
                <div className="order-details-content">
                    <div className="order-info">
                        <div className="order-details-info-container">
                            <div className="order-details-info">
                                <div className="order-details-item">
                                    <label>Name</label>
                                    <h5>{(order?.account as unknown as Account).name} {(order?.account as unknown as Account).lastName}</h5>
                                </div>
                                <div className="order-details-item">
                                    <label>Email</label>
                                    <h5>{(order?.account as unknown as Account).email}</h5>
                                </div>
                                <div className="order-details-item">
                                    <label>Phone</label>
                                    <h5>{(order?.account as unknown as Account).phone ? (order?.account as unknown as Account).phone : 'N/A'}</h5>
                                </div>
                                <div className="order-details-item">
                                    <label>Total Tickets</label>
                                    <h5>{order?.sales.length}</h5>
                                </div>
                                <div className="order-details-item">
                                    <label>Created</label>
                                    <h5>{new Date(order?.createdAt!).toLocaleDateString()}</h5>
                                </div>
                                <div className="order-details-item">
                                    <label>Status</label>
                                    {order?.status == OrderStatus.PENDING && <h5 className="pending">{order?.status}</h5>}
                                    {order?.status == OrderStatus.SUCCEEDED && <h5 className="succeded">{order?.status}</h5>}
                                </div>
                            </div>
                        </div>
                        <PieChart data={statusPieChartData} options={statusPieOptions}/>
                        <PieChart data={typePieChartData} options={typePieOptions}/>
                    </div>
                </div>
                <OrderSalesList sales={order?.sales!}/>
            </div>
            <ResendOrderModal orderId={order?._id!} resendOrderModal={resendOrderModalState} setResendOrderModal={setResendOrderModalState}/>
        </>
    );

};