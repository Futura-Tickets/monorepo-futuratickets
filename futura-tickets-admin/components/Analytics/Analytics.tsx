"use client";
import { useEffect, useState } from "react";

// ANTD
import { BarChartOutlined, CalendarOutlined, EuroCircleOutlined, RiseOutlined, TagsOutlined, TeamOutlined, TrophyOutlined } from "@ant-design/icons";

// COMPONENTS
import Error from "@/shared/Error/Error";
import Loader from "@/shared/Loader/Loader";
import ColumnChart from "@/shared/ColumnChart/ColumnChart";
import PieChart from "@/shared/PieChart/PieChart";
import LineChart from "@/shared/LineChart/LineChart";

// SERVICES
import { getEvents, getClients } from "@/shared/services";

// INTERFACES
import { Event, Order, Sale, TicketStatus, PromoterClient } from "@/shared/interfaces";

// STYLES
import "./Analytics.scss";
import NotificationButton from "../NotificationsMenu/NotificationButton";

// CONSTANTS
const ANALYTICS_ERROR = "There was an error loading your data";

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

const pricePieChartData = [
  ["Price Range", "Amount"],
  ["0-10€", 0],
  ["10-25€", 0],
  ["25-50€", 0],
  ["50-100€", 0],
  ["100€+", 0]
];

const agePieChartData = [
  ["Age Range", "Amount"],
  ["18-24", 0],
  ["25-34", 0],
  ["35-44", 0],
  ["45-54", 0],
  ["55+", 0]
];

const lineChartOptions = {
  height: 320,
  backgroundColor: '#fff',
  legend: { position: 'none' },
  curveType: "function",
  lineWidth: 2,
  chartArea: {
    width: '100%',
    height: '100%',
    left: 50,
    right: 20,
    top: 30,
    bottom: 50,
  },
  hAxis: {
    textStyle: {
      color: '#999',
      fontSize: 11,
    }
  },
  vAxis: {
    viewWindowMode: "explicit",
    viewWindow: { min: 0 },
    gridlines: {
      color: '#eaeaea',
      count: 5,
    },
    textStyle: {
      color: '#999',
      fontSize: 11,
    },
    format: '#€'
  },
  colors: ['#049b92'],
};

const statusPieOptions = {
  title: "TICKET STATUS",
  titleTextStyle: {
    color: '#333333',
    fontSize: 12,
    bold: true
  },
  legend: {
    position: 'bottom',
    alignment: 'center',
    textStyle: {
      color: '#333333',
      fontSize: 10
    }
  },
  chartArea: {
    left: 10,
    top: 30,
    width: '90%',
    height: '65%'
  },
  colors: ['#e4e4e4', '#049b92', '#006f94', '#333333', '#8bc34a', '#fe5456', '#ff9800']
};

const rangePieOptions = {
  title: "PRICE DISTRIBUTION",
  titleTextStyle: {
    color: '#333333',
    fontSize: 12,
    bold: true
  },
  legend: {
    position: 'bottom',
    alignment: 'center',
    textStyle: {
      color: '#333333',
      fontSize: 10
    }
  },
  chartArea: {
    left: 10,
    top: 30,
    width: '90%',
    height: '65%'
  },
  colors: ['#049b92', '#04af92', '#04c392', '#04d792', '#04eb92']
};

const agePieOptions = {
  title: "DEMOGRAPHICS",
  titleTextStyle: {
    color: '#333333',
    fontSize: 12,
    bold: true
  },
  legend: {
    position: 'bottom',
    alignment: 'center',
    textStyle: {
      color: '#333333',
      fontSize: 10
    }
  },
  chartArea: {
    left: 10,
    top: 30,
    width: '90%',
    height: '65%'
  },
  colors: ['#049b92', '#04af92', '#04c392', '#04d792', '#04eb92']
};

export default function Analytics() {

  const [events, setEventsState] = useState<Event[]>([]);
  const [clients, setClientsState] = useState<PromoterClient[]>([]);

  const [chartData, setChartData] = useState<any[]>(initialChartData);
  const [statusPieData, setStatusPieChartData] = useState<any[]>(statusPieChartData);
  const [pricePieData, setPricePieChartData] = useState<any[]>(pricePieChartData);
  const [agePieData, setAgePieChartData] = useState<any[]>(agePieChartData);

  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [ticketsSold, setTicketsSold] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(0);
  const [avgTicketPrice, setAvgTicketPrice] = useState<number>(0);
  const [totalCapacity, setTotalCapacity] = useState<number>(0);

  const [loader, setLoader] = useState<boolean>(true);
  const [error, setError] = useState<boolean>();

  const setAnalytics = async(): Promise<void> => {
    try {
      setLoader(true);

      const promises = await Promise.all([
        getEvents(),
        getClients()
      ]);

      setEventsState(promises[0]);
      setClientsState(promises[1]);

      setLoader(false);

    } catch (error) {
      setError(true);
      setLoader(false);
    }
  };

  const calculateAnalytics = (events: Event[]) => {
    let totalRevenue = 0;
    let monthlyRevenue = Array(12).fill(0);
    let pendingTickets = 0;
    let openTickets = 0;
    let saleTickets = 0;
    let soldTickets = 0;
    let transferedTickets = 0;
    let closedTickets = 0;
    let expiredTickets = 0;
    let totalCapacity = 0;

    let priceRange0to10 = 0;
    let priceRange10to25 = 0;
    let priceRange25to50 = 0;
    let priceRange50to100 = 0;
    let priceRangeOver100 = 0;

    let ageRange18to24 = 0;
    let ageRange25to34 = 0;
    let ageRange35to44 = 0;
    let ageRange45to54 = 0;
    let ageRangeOver55 = 0;

    const monthlyData = [...initialChartData];

    events.forEach((event: Event) => {
      totalCapacity += event.capacity || 0;

      event.orders?.forEach((order: Order) => {
        order.sales?.forEach((sale: Sale) => {
          const saleDate = new Date(sale.createdAt);
          const monthIndex = saleDate.getMonth();

          // Price range distribution
          if (sale.price <= 10) {
            priceRange0to10++;
          } else if (sale.price <= 25) {
            priceRange10to25++;
          } else if (sale.price <= 50) {
            priceRange25to50++;
          } else if (sale.price <= 100) {
            priceRange50to100++;
          } else {
            priceRangeOver100++;
          }

          // Demographics
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

          // Status tracking and revenue calculation
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

    const ticketsSold = openTickets + saleTickets + closedTickets;
    const totalTickets = ticketsSold + pendingTickets;

    setTotalEvents(events.length);
    setTicketsSold(ticketsSold);
    setTotalRevenue(totalRevenue);
    setConversionRate(Number(((ticketsSold / totalTickets) * 100).toFixed(1)) || 0);
    setAvgTicketPrice(ticketsSold > 0 ? Number((totalRevenue / ticketsSold).toFixed(2)) : 0);
    setTotalCapacity(totalCapacity);

    const pieChartData = [
      ["Ticket Status", "Amount"],
      ["Pending", pendingTickets],
      ["Open", openTickets],
      ["Sale", saleTickets],
      ["Sold", soldTickets],
      ["Closed", closedTickets],
      ["Expired", expiredTickets],
      ["Transfered", transferedTickets]
    ];

    const pricePieData = [
      ["Price Range", "Amount"],
      ["0-10€", priceRange0to10],
      ["10-25€", priceRange10to25],
      ["25-50€", priceRange25to50],
      ["50-100€", priceRange50to100],
      ["100€+", priceRangeOver100]
    ];

    const agePieData = [
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

  useEffect(() => {
    setAnalytics();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      calculateAnalytics(events);
    }
  }, [events]);

  if (loader) return <Loader/>;
  if (error) return <Error errorMsg={ANALYTICS_ERROR}/>;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1><BarChartOutlined/> Analytics</h1>
        <div className="analytics-header-actions">
          <NotificationButton />
        </div>
      </div>

      <div className="analytics-stats">
        <div className="analytics-stat">
          <span>Total Events <CalendarOutlined /></span>
          {totalEvents}
        </div>
        <div className="analytics-stat">
          <span>Tickets Sold <TagsOutlined /></span>
          {ticketsSold}
        </div>
        <div className="analytics-stat">
          <span>Total Revenue <EuroCircleOutlined /></span>
          {totalRevenue.toFixed(2)} €
        </div>
        <div className="analytics-stat">
          <span>Conversion Rate <RiseOutlined /></span>
          {conversionRate}%
        </div>
        <div className="analytics-stat">
          <span>Avg Ticket Price <TrophyOutlined /></span>
          {avgTicketPrice} €
        </div>
        <div className="analytics-stat">
          <span>Total Clients <TeamOutlined /></span>
          {clients.length}
        </div>
      </div>

      {events.length === 0 && (
        <div className="analytics-content not-found">
          <h2>No events data available</h2>
          <p>Create events to start seeing analytics</p>
        </div>
      )}

      {events.length > 0 && (
        <>
          <div className="analytics-chart-section">
            <h2>Monthly Revenue</h2>
            <ColumnChart data={chartData} options={lineChartOptions}/>
          </div>

          <div className="analytics-pie-container">
            <div className="analytics-pie-chart">
              <PieChart data={statusPieData} options={statusPieOptions}/>
            </div>
            <div className="analytics-pie-chart">
              <PieChart data={pricePieData} options={rangePieOptions}/>
            </div>
            <div className="analytics-pie-chart">
              <PieChart data={agePieData} options={agePieOptions}/>
            </div>
          </div>
        </>
      )}
    </div>
  );
}