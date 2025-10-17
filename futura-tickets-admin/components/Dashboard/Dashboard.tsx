"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ANTD
import Button from "antd/es/button";
import { CalendarOutlined, DownloadOutlined, EuroCircleOutlined, PlusCircleOutlined, RiseOutlined, TagsOutlined, TeamOutlined, UploadOutlined } from "@ant-design/icons";
import Tooltip from "antd/es/tooltip";

// STATE
import { useGlobalState } from "../GlobalStateProvider/GlobalStateProvider";

// COMPONENTS
import ColumnChart from "@/shared/ColumnChart/ColumnChart";
import Error from "@/shared/Error/Error";
import Loader from "@/shared/Loader/Loader";
import PieChart from "@/shared/PieChart/PieChart";

// SERVICES
import { getClients, getEvents } from "@/shared/services";

// INTERFACES
import { Event, Order, PromoterClient, Sale, TicketStatus } from "@/shared/interfaces";

// STYLES
import "./Dashboard.scss";
import NextEvents from "./NextEvents/NextEvents";
import NotificationButton from "../NotificationsMenu/NotificationButton";

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
};

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

const pricePieChartData = [
  ["Price Range", "Amount"],
  ["0-10", 0],
  ["10-25", 0],
  ["25-50", 0],
  ["50-100", 0]
];

const agePieChartData = [
  ["Age Range", "Amount"],
  ["18-24", 0],
  ["25-34", 0],
  ["35-44", 0],
  ["45-54", 0],
  ["55+", 0]
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

const rangePieOptions = {
  title: "PRICE RANGE",
  titleTextStyle: {
    color: '#333333',
    fontSize: 11,
    bold: true
  },
  legend: { 
    position: 'bottom',
    alignment: 'center',
    maxLines: 2, 
    textStyle: {
      color: '#333333',
      fontSize: 10
    }
  },
  chartArea: {
    left: 10,
    top: 30,
    width: '90%',
    height: '70%'
  },
  colors: ['#049b92', '#04af92', '#04c392', '#04d792', '#04eb92', '#04eb92', '#04ff92']
};

const agePieOptions = {
  title: "DEMOGRAPHICS",
  titleTextStyle: {
    color: '#333333',
    fontSize: 11,
    bold: true
  },
  legend: { 
    position: 'bottom',
    alignment: 'center',
    maxLines: 2,
    textStyle: {
      color: '#333333',
      fontSize: 10
    }
  },
  chartArea: {
    left: 10,
    top: 30,
    width: '90%',
    height: '70%'
  },
  colors: ['#049b92', '#04af92', '#04c392', '#04d792', '#04eb92', '#04eb92', '#04ff92']
};

const color = '#333333';

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

export default function Events() {

  const router = useRouter();
  const [state, dispatch] = useGlobalState();

  const [clients, setUsersState] = useState<PromoterClient[]>([]);
  const [events, setEventsState] = useState<Event[]>([]);

  const [chartData, setChartData] = useState<any[]>(initialChartData);
  const [statusPieData, setStatusPieChartData] = useState<any[]>(statusPieChartData);
  const [pricePieData, setPricePieChartData] = useState<any[]>(pricePieChartData);
  const [agePieData, setAgePieChartData] = useState<any[]>(agePieChartData);

  const [ticketsSold, setTicketsSold] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(0);

  const [loader, setLoader] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);


  const setDashboard = async (): Promise<void> => {
    try {

      setLoader(true);

      const promises = await Promise.all([
        getEvents(),
        getClients()
      ]);

      setEventsState(promises[0]);
      setUsersState(promises[1]);

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

    // setPieData(pieChartData);

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
      ["Transfered", transferedTickets]
    ];

    let pricePieData = [
      ["Price Range", "Amount"],
      ["0-10", priceRange0to10],
      ["10-25", priceRange10to25],
      ["25-50", priceRange25to50],
      ["50-100", priceRange50to100]
    ];

    let agePieData = [
      ["Age Range", "Amount"],
      ["18-24", ageRange18to24],
      ["25-34", ageRange25to34],
      ["35-44", ageRange35to44],
      ["45-54", ageRange45to54],
      ["55+", ageRangeOver55]
    ];

    setStatusPieChartData(pieChartData);
    setPricePieChartData(pricePieData);
    setAgePieChartData(agePieData);
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
    setDashboard();
  }, []);

  useEffect(() => {
    events.length > 0 && calculateChartDataV2(events);
  }, [events]);

  if (loader) return <Loader/>;
  if (error) return <Error errorMsg={USERS_ERROR}/>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1><CalendarOutlined /> Dashboard</h1>
        <div className="dashboard-header-actions">
          <Tooltip placement="bottom" title="Create Event" color={color}>
            <div className="dashboard-header-action" onClick={() => navigateTo("/events/create-event")}>
              <PlusCircleOutlined />
            </div>
          </Tooltip>
          <NotificationButton />
        </div>
      </div>
      <>
        <div className="dashboard-stats">
          <div className="dashboard-stat">
            <span>Total Events <CalendarOutlined /></span>
            {events.length}
          </div>
          <div className="dashboard-stat">
            <span>Tickets Sold <TagsOutlined /></span>
            {ticketsSold}
          </div>
          <div className="dashboard-stat">
            <span>Total Revenue <EuroCircleOutlined /></span>
            {totalRevenue} EUR
          </div>
          <div className="dashboard-stat">
            <span>Conversion Rate <RiseOutlined /></span>
            {conversionRate}%
          </div>
          <div className="dashboard-stat">
            <span>Total Clients <TeamOutlined /></span>
            {clients.length}
          </div>
        </div>
        <ColumnChart data={chartData} options={lineChartOptions}/>
        {events.length == 0 && (
          <div className="dashboard-content not-found">
            <h2>No events found</h2>
            <Button onClick={() => navigateTo("/events/create-event")} size="large">Create your first event</Button>
          </div>
        )}
        {events.length > 0 && (
          <div className="dashboard-pie-container">
            <NextEvents events={events}/>
            <PieChart data={pricePieData} options={rangePieOptions}/>
            <PieChart data={agePieData} options={agePieOptions}/>
          </div>
        )}
      </>
    </div>
  );

}