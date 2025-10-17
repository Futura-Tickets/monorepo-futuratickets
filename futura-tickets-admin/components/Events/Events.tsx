"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ANTD
import { CalendarOutlined, EuroCircleOutlined, FileTextOutlined, FilterOutlined, PlusCircleOutlined, RiseOutlined, TagsOutlined, TeamOutlined } from "@ant-design/icons";
import Tooltip from "antd/es/tooltip";

// COMPONENTS
import EventsList from "./EventsList/EventsList";
import Error from "@/shared/Error/Error";
import Loader from "@/shared/Loader/Loader";
import NotificationButton from "../NotificationsMenu/NotificationButton";

// SERVICES
import { getClients, getEvents } from "@/shared/services";

// INTERFACES
import { Event, Order, PromoterClient, Sale, TicketStatus } from "@/shared/interfaces";

// STYLES
import "./Events.scss";
import ColumnChart from "@/shared/ColumnChart/ColumnChart";

// CONSTANTS
const USERS_ERROR = "There was an error loading your events";

const pieChartData = [
  ["Ticket Status", "Amount"],
  ["Pending", 0],
  ["Open", 0],
  ["Sale", 0],
  ["Sold", 0],
  ["Closed", 0],
  ["Expired", 0],
  ["Transfered", 0],
];

const pieOptions = {
  title: "",
  legend: { position: 'none' },
  colors: ['#e4e4e4', '#049b92', '#006f94', '#e4e4e4', '#fe5456', '#fe5456', '#e4e4e4']
};

const lineChartOptions =  {
  height: 280,
  backgroundColor: '#fff',
  legend: { position: 'none' },
  curveType: "function",
  lineWidth: 1.5,
  chartArea: {
    width: '100%',
    height: '100%',
    left: 30,
    right: 0,
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
  colors: ['#049b92'],
}

const initialChartData = [
  ["Month", "Revenue"],
  ["Jan", 0],
  ["Feb", 0],
  ["Mar", 0],
  ["Apr", 0],
  ["May", 0],
  ["Jun", 0],
  ["Jul", 0],
  ["Aug", 0],
  ["Sep", 0],
  ["Oct", 0],
  ["Nov", 0],
  ["Dec", 0]
];

const color = '#333333';

export default function Events() {

  const router = useRouter();

  const [events, setEventsState] = useState<Event[]>([]);
  const [chartData, setChartData] = useState<any[]>(initialChartData as any);
  const [pieData, setPieData] = useState<any[]>(pieChartData);

  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [ticketsSold, setTicketsSold] = useState<number>(0);
  const [clients, setClientsState] = useState<PromoterClient[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(0);

  const [loader, setLoader] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const setEvents = async(): Promise<void> => {
    try {

        setLoader(true);

        const promises = await Promise.all([
          getEvents(),
          getClients()
        ]);
  
        setEventsState(promises[0]);
        setClientsState(promises[1]);

        const events = await getEvents();
        setEventsState(events);

        setLoader(false);

    } catch (error) {
      setError(true);
      setLoader(false);
    }
  };

  const calculateChartData = (events: Event[]) => {

    let totalRevenue = 0;

    let pendingTickets = 0;
    let openTickets = 0;
    let saleTickets = 0;
    let soldTickets = 0;
    let transferedTickets = 0;
    let closedTickets = 0;
    let expiredTickets = 0;

    events.forEach((event: Event) => {
      event.orders.forEach((order: Order) => {
        order.sales.forEach((sale: Sale) => {

          if (sale.status == TicketStatus.PENDING) {
            pendingTickets += 1;
          }

          if (sale.status == TicketStatus.OPEN) {
            openTickets += 1;
            totalRevenue += sale.price;
          }

          if (sale.status == TicketStatus.SALE) {
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
            closedTickets += 1;
            totalRevenue += sale.price;
          }

          if (sale.status == TicketStatus.EXPIRED) {
            expiredTickets += 1;
            totalRevenue += sale.price;
          }
          
        });
      });
    });

    let ticketsSold = openTickets + saleTickets + closedTickets;

    setConversionRate(Number(((ticketsSold / (ticketsSold + pendingTickets)) * 100).toFixed(1)) || 0);
    setTicketsSold(ticketsSold);
    setTotalRevenue(totalRevenue);

    let pieChartData = [
      ["Ticket Status", "Amount"],
      ["Pending", pendingTickets],
      ["Open", openTickets],
      ["Sale", saleTickets],
      ["Sold", soldTickets],
      ["Closed", closedTickets],
      ["Expired", expiredTickets],
      ["Transfered", transferedTickets],
    ];

    setPieData(pieChartData);

  };

  const calculateDaysToEvent = (eventLaunchDate: Date, eventStartDate: Date): number => {
    const date1 = new Date(eventLaunchDate);
    const date2 = new Date(eventStartDate);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateChartDataV2 = (events: Event[]) => {

    let totalRevenue = 0;
    let totalOrders = 0;
    let monthlyRevenue = Array(12).fill(0);
    let pendingTickets = 0;
    let openTickets = 0;
    let saleTickets = 0;
    let soldTickets = 0;
    let transferedTickets = 0;
    let closedTickets = 0;
    let expiredTickets = 0;

    let priceRange0to10 = 0;
    let priceRange10to25 = 0;
    let priceRange25to50 = 0;
    let priceRange50to100 = 0;
    
    let ageRange18to24 = 0;
    let ageRange25to34 = 0;
    let ageRange35to44 = 0;
    let ageRange45to54 = 0;
    let ageRangeOver55 = 0;

    const monthlyData = [...initialChartData];

    events.forEach((event: Event) => {
        event.orders.forEach((order: Order) => {

          totalOrders += 1;
          
          order.sales.forEach((sale: Sale) => {

              const saleDate = new Date(sale.createdAt);
              const monthIndex = saleDate.getMonth();

              if (sale.price <= 10) {
                priceRange0to10++;
              } else if (sale.price <= 25) {
                priceRange10to25++;
              } else if (sale.price <= 50) {
                priceRange25to50++;
              } else if (sale.price <= 100) {
                priceRange50to100++;
              }

              if (sale.client && sale.client.birthdate) {
                const birthDate = new Date(sale.client.birthdate);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
                
                if (age >= 18 && age <= 24) ageRange18to24++;
                else if (age >= 25 && age <= 34) ageRange25to34++;
                else if (age >= 35 && age <= 44) ageRange35to44++;
                else if (age >= 45 && age <= 54) ageRange45to54++;
                else if (age >= 55) ageRangeOver55++;
              }

              if (sale.status === TicketStatus.OPEN) {
                openTickets++;
                totalRevenue += sale.price;
                monthlyRevenue[monthIndex] += sale.price;
                monthlyData[monthIndex + 1][1] = monthlyRevenue[monthIndex];
              }
              
              if (sale.status === TicketStatus.SALE) {
                saleTickets++;
                totalRevenue += sale.price;
                monthlyRevenue[monthIndex] += sale.price;
                monthlyData[monthIndex + 1][1] = monthlyRevenue[monthIndex];
              }
              
              if (sale.status === TicketStatus.CLOSED) {
                closedTickets++;
                totalRevenue += sale.price;
                monthlyRevenue[monthIndex] += sale.price;
                monthlyData[monthIndex + 1][1] = monthlyRevenue[monthIndex];
              }

              if (sale.status === TicketStatus.PENDING) pendingTickets++;
              if (sale.status === TicketStatus.SOLD) soldTickets++;
              if (sale.status === TicketStatus.TRANSFERED) transferedTickets++;
              if (sale.status === TicketStatus.EXPIRED) expiredTickets++;

          });

        });
    });

    let ticketsSold = openTickets + saleTickets + closedTickets;

    setTotalOrders(totalOrders);
    setConversionRate(Number(((ticketsSold / (ticketsSold + pendingTickets)) * 100).toFixed(1)) || 0);
    setTicketsSold(ticketsSold);
    setTotalRevenue(totalRevenue);

    setChartData(monthlyData);
  };

  const calculateDaysBetweenDates = (launchDate: Date, endDate: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000;
    const eventLaunchDate = launchDate.setHours(0, 0, 0, 0);
    const eventEndDate = endDate.setHours(0, 0, 0, 0);
    return Math.round(Math.abs((eventLaunchDate - eventEndDate) / oneDay));
  };

  const navigateTo = (route: string): void => {
    setLoader(true);
    router.push(route);
  };

  useEffect(() => {
    setEvents();
  }, []);

  useEffect(() => {
    events.length > 0 && calculateChartDataV2(events);
  }, [events]);

  if (loader) return <Loader/>;
  if (error) return <Error errorMsg={USERS_ERROR}/>;

  return (
    <div className="events-container">
      <div className="events-header">
        <h1><CalendarOutlined /> Events</h1>
        <div className="events-header-actions">
          <Tooltip placement="bottom" title="Filter" color={color}>
            <div className="events-header-action">
              <FilterOutlined />
            </div>
          </Tooltip>
          {/*
            <Tooltip placement="bottom" title="Calendar" color={color}>
              <div className="events-header-action" onClick={() => navigateTo("/events/calendar")}>
                <CalendarOutlined />
              </div>
            </Tooltip>
          */}
          <Tooltip placement="bottom" title="Create Event" color={color}>
            <div className="events-header-action" onClick={() => navigateTo("/events/create-event")}>
              <PlusCircleOutlined />
            </div>
          </Tooltip>
          <NotificationButton />
        </div>
      </div>
      <div className="events-stats">
        <div className="events-stat">
          <span>Total Revenue <EuroCircleOutlined /></span>
          {totalRevenue} EUR
        </div>
        <div className="events-stat">
          <span>Tickets Orders <FileTextOutlined /></span>
          {totalOrders}
        </div>
        <div className="events-stat">
          <span>Tickets Sold <TagsOutlined /></span>
          {ticketsSold}
        </div>
        <div className="events-stat">
          <span>Conversion Rate <RiseOutlined /></span>
          {conversionRate}%
        </div>
        <div className="events-stat">
          <span>Total Clients <TeamOutlined /></span>
          {clients.length}
        </div>
      </div>
      <ColumnChart data={chartData} options={lineChartOptions}/>
      <EventsList events={events}/>
    </div>
  );

}