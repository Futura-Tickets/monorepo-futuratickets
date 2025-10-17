"use client";
import { useEffect, useState } from "react";

// ANTD
import { EuroCircleOutlined, FileTextOutlined, FilterOutlined, GlobalOutlined, RiseOutlined, TagsOutlined, TeamOutlined } from "@ant-design/icons";

// STATE
import { useGlobalState } from "../GlobalStateProvider/GlobalStateProvider";

// COMPONENTS
import ColumnChart from "@/shared/ColumnChart/ColumnChart";
import Error from "@/shared/Error/Error";
import Loader from "@/shared/Loader/Loader";
import UsersList from "./UsersList/UsersList";

// SERVICES
import { exportClientsCSVRequest, getClients } from "@/shared/services";

// INTERFACES
import { Order, PromoterClient, Sale, TicketStatus } from "@/shared/interfaces";

// STYLES
import "./Users.scss";
import NotificationButton from "../NotificationsMenu/NotificationButton";
import ExportCsv from "@/shared/ExportEventCsv/ExportEventCsv";

// CONSTANTS
const USERS_ERROR = "There was an error loading your users";

const columnChartOptions =  {
  height: 280,
  backgroundColor: '#fff',
  legend: { position: 'none' },
  chartArea: {
    width: '100%',
    height: '100%',
    left: 30,
    right: 15,
    top: 20,
    bottom: 30,
    stroke: '#fff',
    strokeWidth: 0
  },
  hAxis: {
    height: 100,
    minTextSpacing : 20,
    textStyle: {
      color: '#999',
      fontName: 'Arial',
      fontSize: 10,
      bold: false,
      italic: false
    }
  },
  vAxis: {
    viewWindowMode: "explicit",
    viewWindow:{ min: 0 },
    minValue: 10,
    baselineColor: '#e4e4e4',
    gridlines: {
      color: '#eaeaea',
      count: 4,
    },
    textStyle: {
      color: '#999',
      fontName: 'Arial',
      fontSize: 10,
      bold: false,
      italic: false
    }
  },
  bar: { groupWidth: "61.8%" },
  colors: ['#049b92'],
}

const initialChartData = [["Day", "Sales"],["", 0]];

const EXPORT_CLIENTS_CSV = "Export Clients CSV";

export default function Users() {

  const [state, dispatch] = useGlobalState();

  const [clients, setUsersState] = useState<PromoterClient[]>([]);
  const [chartData, setChartData] = useState<[[string, any]]>(initialChartData as any);

  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [ticketsSold, setTicketsSold] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(0);
  
  const [loader, setLoader] = useState<boolean>(false);
  const [error, setError] = useState<boolean>();
  const [errorMsg, setErrorMsg] = useState<string>();

  const setUsers = async(): Promise<void> => {
    try {

        setLoader(true);

        const clients = await getClients();
        setUsersState(clients);

        setLoader(false);

    } catch (error) {
      setErrorMsg(USERS_ERROR);
      setError(true);
      setLoader(false);
    }
  };

  const calculateChartData = (launchDate: Date, endDate: Date, clients: PromoterClient[]) => {

    const parsedLaunchDate = new Date(launchDate);
    const parsedEndDate = new Date(endDate);

    const days = calculateDaysBetweenDates(parsedLaunchDate, parsedEndDate);
    const chartData: [[string, any]] = [["Day", "Sales"]];
    
    // const eventLaunchDate = new Date(2024, 11, 1, 0, 0, 0, 0);
    const eventLaunchDate = new Date(parsedLaunchDate.getFullYear(), parsedLaunchDate.getMonth(), parsedLaunchDate.getDate(), 0, 0, 0, 0);

    for (let i = 0; i <= days; i++) {
      i != 0 && eventLaunchDate.setDate(eventLaunchDate.getDate() + 1);
      chartData.push([`${eventLaunchDate.getDate()}/${eventLaunchDate.getMonth() + 1}`, 0]);
    }

    let totalRevenue = 0;

    let ticketsSold = 0;
    let totalOrders = 0;
    let pendingTickets = 0;
    let openTickets = 0;
    let saleTickets = 0;
    let soldTickets = 0;
    let transferedTickets = 0;
    let closedTickets = 0;
    let expiredTickets = 0;

    clients.forEach((client: PromoterClient) => {
      client.client.orders.forEach((order: Order) => {

        totalOrders += 1;

        order.sales.forEach((sale: Sale) => {

          if (sale.status == TicketStatus.PENDING) {
            pendingTickets += 1;
          }

          if (sale.status == TicketStatus.OPEN) {
            ticketsSold += 1;
            openTickets += 1;
            totalRevenue += sale.price;
          }

          if (sale.status == TicketStatus.SALE) {
            ticketsSold += 1;
            saleTickets += 1;
            totalRevenue += sale.price;
          }

          if (sale.status == TicketStatus.SOLD) {
            soldTickets += 1;
          }

          if (sale.status == TicketStatus.TRANSFERED) {
            transferedTickets += 1;
          }

          if (sale.status == TicketStatus.CLOSED) {
            ticketsSold += 1;
            closedTickets += 1;
            totalRevenue += sale.price;
          }

          if (sale.status == TicketStatus.EXPIRED) {
            ticketsSold += 1;
            expiredTickets += 1;
            totalRevenue += sale.price;
          }

          const saleDate = new Date(sale.createdAt);
          const saleParsedDate = `${saleDate.getDate()}/${saleDate.getMonth() + 1}`;

          chartData.forEach((data: [string, any]) => {
            if (data[0] == saleParsedDate && (sale.status == TicketStatus.OPEN || sale.status == TicketStatus.SALE || sale.status == TicketStatus.CLOSED || sale.status == TicketStatus.EXPIRED)) {
              data[1] += 1;
            }
          });
          
        });
      });
    });

    setTicketsSold(ticketsSold);
    setTotalRevenue(totalRevenue);
    setTotalOrders(totalOrders);
    setConversionRate(Number(((ticketsSold / (ticketsSold + pendingTickets)) * 100).toFixed(1)) || 0);

    setChartData(chartData.length > 1 ? [...chartData] : initialChartData as any);

  };

  const calculateDaysBetweenDates = (launchDate: Date, endDate: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000;
    const eventLaunchDate = launchDate.setHours(0, 0, 0, 0);
    const eventEndDate = endDate.setHours(0, 0, 0, 0);
    return Math.round(Math.abs((eventLaunchDate - eventEndDate) / oneDay));
  };

  const exportClientsCSV = async (): Promise<void> => {
    try {
      await exportClientsCSVRequest();
    } catch (error) {
      console.log('asfasf')
    }
};

  useEffect(() => {
    setUsers();
  }, []);

  useEffect(() =>  {
    clients.length > 0 && calculateChartData(state?.account?.promoter?.createdAt!, new Date(), clients);
  }, [clients]);

  if (loader) return <Loader/>;
  if (error) return <Error errorMsg={USERS_ERROR}/>;

  return (
    <div className="users-container">
      <div className="users-header">
        <h1><TeamOutlined/> Clients</h1>
        <div className="event-header-actions">
            <div className="event-header-action">
              <FilterOutlined/>
            </div>
            <ExportCsv title={EXPORT_CLIENTS_CSV} exportRequest={exportClientsCSV}/>
            <NotificationButton />
        </div>
      </div>
      <div className="users-stats">
        <div className="users-stat">
          <span>Total Revenue <EuroCircleOutlined /></span>
          {totalRevenue} EUR
        </div>
        <div className="users-stat">
          <span>Total Orders <FileTextOutlined /></span>
          {totalOrders}
        </div>
        <div className="users-stat">
          <span>Tickets Sold <TagsOutlined /></span>
          {ticketsSold}
        </div>
        <div className="users-stat">
          <span>Conversion Rate <RiseOutlined /></span>
          {conversionRate}%
        </div>
        <div className="users-stat">
          <span>Total Clients <TeamOutlined /></span>
          {clients.length}
        </div>
      </div>
      <ColumnChart data={chartData} options={columnChartOptions}/>
      <UsersList promoterClients={clients}/>
    </div>
  );
}