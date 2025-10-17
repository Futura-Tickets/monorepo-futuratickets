"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// STATE
import { useGlobalState } from "../GlobalStateProvider/GlobalStateProvider";

// ANTD
import { CalendarOutlined, EuroCircleOutlined, FileTextOutlined, FilterOutlined, GlobalOutlined, RiseOutlined, TagsOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

// COMPONENTS
import Error from "@/shared/Error/Error";
import GoBack from "@/shared/GoBack/GoBack";
import Loader from "@/shared/Loader/Loader";
import PieChart from "@/shared/PieChart/PieChart";
import UserSalesList from "./UserSalesList/UserSalesList";

// SERVICES
import { getClient } from "@/shared/services";

// INTERFACES
import { Event, Order, PromoterClient, Sale, TicketStatus } from "@/shared/interfaces";

// STYLES
import './User.scss';
import NotificationButton from "../NotificationsMenu/NotificationButton";

// CONSTANTS
const USER_ERROR = "There was an error loading your user";

const statusPieChartData = [
    ["Ticket Status", "Amount"],
    ["Pending", 0],
    ["Open", 0],
    ["Sale", 0],
    ["Sold", 0],
    ["Closed", 0],
    ["Expired", 0],
    ["Transfered", 0]
];

const typePieChartData = [
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
    colors: ['#e4e4e4', '#049b92', '#006f94', '#333333', '#fe5456', '#fe5456', '#333333']
};

const typePieOptions = {
    title: "TYPE",
    titleTextStyle: {
        color: '#333333',
        fontSize: 11,
        bold: true
    },
    legend: { position: 'none' },
    colors: ['#049b92', '#04af92', '#04c392', '#04d792', '#04eb92', '#04eb92', '#04ff92']
};

const color = '#333333';

export default function User() {

    const pathname = usePathname();
    const [state, dispatch] = useGlobalState();

    const [client, setClientState] = useState<PromoterClient>();
    const [filterState, setFilterState] = useState<boolean>(false);
    const [statusPieData, setStatusPieChartData] = useState<any[]>(statusPieChartData);
    const [typePieData, setTypePieChartData] = useState<any[]>(typePieChartData);
    const [conversionRate, setConversionRate] = useState<number>(0);

    const [loader, setLoader] = useState<boolean>(true);
    const [error, setError] = useState<boolean>();

    const setClient = async(clientId: string): Promise<void> => {
        try {

            setLoader(true);

            const client = await getClient(clientId);
            setClientState(client);
            
            setLoader(false);

        } catch (error) {
            setError(true);
            setLoader(false);
        }
    };

    const calculateTotalEvents = (orders: Order[]): number => {
        const events: string[] = [];
        orders.forEach((order: Order) => {
            let found = false;
            events.forEach((event: string) => {
                if ((order.event as unknown as Event)._id == event) found = true;
            });
            if (!found) events.push((order.event as unknown as Event)._id);
        });
        return events.length;
    };

    const calculateTotalAmount = (orders: Order[]): number => {
        return orders.reduce((accumulator: number, order: Order) => accumulator + order.sales.filter((sale: Sale) => (sale.status == TicketStatus.OPEN || sale.status == TicketStatus.CLOSED || sale.status == TicketStatus.SALE)).reduce((accumulator: number, sale: Sale) => accumulator + sale.price, 0), 0) || 0;
    };

    const calculatePieChartData = (orders: Order[]) => {

        let pendingTickets = 0;
        let openTickets = 0;
        let saleTickets = 0;
        let soldTickets = 0;
        let transferedTickets = 0;
        let closedTickets = 0;
        let expiredTickets = 0;
        let ticketsSold = 0;

        let types: [string, number][] = [];

        orders.forEach((order: Order) => {
            order.sales.forEach((sale: Sale) => {

                const foundType = types.find((type: [string, number]) => type[0] == sale.type);
                if (!foundType) {
                    types.push([sale.type, 1]);
                } else {
                    types = types.map((type: [string, number]) => type[0] == sale.type ? [type[0], type[1] + 1] : type);
                }
        
                if (sale.status == TicketStatus.PENDING) pendingTickets += 1;
                if (sale.status == TicketStatus.OPEN) openTickets += 1;
                if (sale.status == TicketStatus.SALE) saleTickets += 1;
                if (sale.status == TicketStatus.SOLD) soldTickets += 1;
                if (sale.status == TicketStatus.TRANSFERED) transferedTickets += 1;
                if (sale.status == TicketStatus.CLOSED) closedTickets += 1;
                if (sale.status == TicketStatus.EXPIRED) expiredTickets += 1;
              
            });
        });

        let statusPieChartData = [
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

        ticketsSold = openTickets + saleTickets + closedTickets;

        setConversionRate(Number(((ticketsSold / (ticketsSold + pendingTickets)) * 100).toFixed(1)) || 0);

    };

    useEffect(() => {
        const clientId = pathname.split('/')[2]
        clientId && setClient(clientId);
        state.goBackRoute && dispatch({ goBackRoute: undefined });
    }, []);

    useEffect(() => {
        client?.client.orders.length && calculatePieChartData(client?.client.orders);
    }, [client]);

    if (loader) return <Loader/>;
    if (error) return <Error errorMsg={USER_ERROR}/>;

    return (
        <div className="user-container">
            <div className="user-header">
                <GoBack route="/clients"/>
                <h1>{client?.client.name} {client?.client.lastName}</h1>
                <div className="user-header-actions">
                    <Tooltip placement="bottom" title="Filter" color={color}>
                        <div className={`user-header-action ${filterState ? "active" : ""}`} onClick={() => setFilterState && setFilterState(!filterState)}>
                            <FilterOutlined />
                        </div>
                    </Tooltip>
                    < NotificationButton/>
                </div>
            </div>
            <div className="user-stats">
                <div className="user-stat">
                    <span>Total Revenue <EuroCircleOutlined /></span>
                    {calculateTotalAmount(client?.client.orders || [])} EUR
                </div>
                <div className="user-stat">
                    <span>Total Orders <FileTextOutlined/></span>
                    {client?.client.orders.length}
                </div>
                <div className="user-stat">
                    <span>Total Tickets <TagsOutlined /></span>
                    {client?.client.orders.reduce((accumulator: number, order: Order) => accumulator + order.sales.length, 0) || 0}
                </div>
                <div className="user-stat">
                    <span>Total Events <CalendarOutlined /></span>
                    {calculateTotalEvents(client?.client.orders!)}
                </div>
                <div className="user-stat">
                    <span>Conversion Rate <RiseOutlined /></span>
                    {conversionRate}%
                </div>
            </div>
            <div className="user-content">
                <div className="user-details-container">
                    <div className="user-details">
                        <div className="user-details-item">
                            <label>Name</label>
                            <h5>{client?.client.name} {client?.client.lastName}</h5>
                        </div>
                        <div className="user-details-item">
                            <label>Email</label>
                            <h5>{client?.client.email}</h5>
                        </div>
                        <div className="user-details-item">
                            <label>Phone</label>
                            <h5>{client?.client.phone ? client?.client.phone : 'N/A'}</h5>
                        </div>
                        <div className="user-details-item"></div>
                        <div className="user-details-item">
                            <label>Gender</label>
                            <h5>{client?.client.gender ? client?.client.gender : 'N/A'}</h5>
                        </div>
                        <div className="user-details-item">
                            <label>Birthdate</label>
                            <h5>{client?.client.birthdate ? new Date(client?.client.birthdate).toLocaleDateString() : 'N/A'}</h5>
                        </div>
                        <div className="user-details-item">
                            <label>Registration Date</label>
                            <h5>{new Date(client?.createdAt!).toLocaleDateString()}</h5>
                        </div>
                    </div>
                    <PieChart data={statusPieData} options={statusPieOptions}/>
                    <PieChart data={typePieData} options={typePieOptions}/>
                </div>
                <UserSalesList orders={client?.client.orders || []}/>
            </div>
        </div>
    )
}