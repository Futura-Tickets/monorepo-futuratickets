"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// STATE
import { useGlobalState } from "@/components/GlobalStateProvider/GlobalStateProvider";

// SOCKET
import { socketAccess } from "@/components/SocketAccess";

// COMPONENTS
import AccessList from "./AccessList/AccessList";
import ColumnChart from "@/shared/ColumnChart/ColumnChart";
import Error from "@/shared/Error/Error";
import EventActions from "../EventActions/EventActions";
import EventFilters from "../EventFilters/EventFilters";
import GoBack from "@/shared/GoBack/GoBack";
import Loader from "@/shared/Loader/Loader";

// SERVICES
import { getEventAccess } from "@/shared/services";

// UTILS
import { calculateHoursBetweenDates, formatTwoDigits } from "@/shared/utils/utils";

// INTERFACES
import { EmitAccess, Event, Order, Sale, SaleHistory, TicketActivity, FilterConfig } from "@/shared/interfaces";

// STYLES
import "./Access.scss";

// CONSTANTS
const ACCESS_ERROR = "There was an error loading your data";

let socketIsAccessSubscribed = false;

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
  colors: ['#049b92', '#fe5456'],
}

export default function Access() {

  const pathname = usePathname();
  const [state, dispatch] = useGlobalState();

  const [eventAccess, setEventAccessState] = useState<Event>();
  const [filterState, setFilterState] = useState<boolean>(false);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    type: 'sales',
    status: '',
    search: ''
  });
  const [eventAccessList, setEventAccessListState] = useState<Sale[]>();
  const [chartData, setChartData] = useState<[[string, any, any]]>([["Time", "Granted", "Denied"]]);

  const [loader, setLoader] = useState<boolean>(true);
  const [error, setError] = useState<boolean>();

  const setEventAccess = async(eventId: string): Promise<void> => {
    try {

      setLoader(true);

      const eventAccess = await getEventAccess(eventId);
      setEventAccessState(eventAccess);

      const eventAccessList = eventAccess.orders.flatMap((order: Order) => order.sales.filter((sale: Sale) => sale.history?.find((history: SaleHistory) => history.activity == TicketActivity.GRANTED || history.activity == TicketActivity.DENIED))).flatMap((sale: Sale) => sale) || [];

      setEventAccessListState(eventAccessList);

      setLoader(false);

    } catch (error) {
      setError(true);
      setLoader(false);
    }
  };

  const calculateChartData = (startDate: Date, endDate: Date, eventAccessList: Sale[]) => {

    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);

    const parsedLaunchDate = new Date(newStartDate.getFullYear(), newStartDate.getMonth(), newStartDate.getDay(), newStartDate.getHours(), newStartDate.getMinutes());
    const parsedEndDate = new Date(newEndDate.getFullYear(), newEndDate.getMonth(), newEndDate.getDay(), newEndDate.getHours(), newEndDate.getMinutes());

    const hours = calculateHoursBetweenDates(parsedLaunchDate, parsedEndDate);

    const chartData: [[string, any, any]] = [["Time", "Granted", "Denied"]];
    
    for (let i = 0; i <= hours; i++) {
      i != 0 && parsedLaunchDate.setTime(parsedLaunchDate.getTime() + (60 * 60 * 1000));
      chartData.push([`${formatTwoDigits(parsedLaunchDate.getHours())}:${formatTwoDigits(parsedLaunchDate.getMinutes())}`, 0, 0]);
    }

    eventAccessList.forEach((sale: Sale) => {
      sale.history?.forEach((saleHistory: SaleHistory) => {

        const saleDate = new Date(saleHistory.createdAt);
        const saleParsedDate = `${formatTwoDigits(saleDate.getHours())}:00`;

        chartData.forEach((data: [string, any, any]) => {
          if (data[0] == saleParsedDate && saleHistory.activity == TicketActivity.GRANTED) data[1] += 1;
          if (data[0] == saleParsedDate && saleHistory.activity == TicketActivity.DENIED) data[2] += 1;
        });

      })
    });

    setChartData([...chartData]);

  };

  const subscribeAccessEvent = (): void => {

    console.log('Subscribed to access! ', eventAccess?._id);

    socketIsAccessSubscribed = true;

    socketAccess.on('access', (value: EmitAccess) => {

      if (eventAccess?._id == value.event) {

        const accessItem: Sale = {
          _id: value._id,
          order: value.order,
          event: {
            _id: eventAccess._id,
            name: eventAccess.name,
            address: eventAccess.address
          },
          client: {
            name: value.client.name,
            lastName: value.client.lastName,
            email: value.client.email
          },
          history: value.history,
          tokenId: value.tokenId,
          hash: value.hash,
          type: value.type,
          price: value.price,
          status: value.status,
          qrCode: value.qrCode,
          createdAt: value.createdAt
        }

        setEventAccessListState([accessItem, ...eventAccessList!]);
        calculateChartData(eventAccess?.dateTime.startDate, eventAccess?.dateTime.endDate, [accessItem, ...eventAccessList!]);

      }
    });
  };

  useEffect(() => {
    const eventId = pathname.split("/")[2];
    eventId && setEventAccess(eventId);
    state.goBackRoute && dispatch({ goBackRoute: undefined });
  }, []);

  useEffect(() => {
    eventAccess && eventAccessList && calculateChartData(eventAccess?.dateTime.startDate, eventAccess?.dateTime.endDate, eventAccessList);
  }, [eventAccess, eventAccessList]);

  useEffect(() => {
    eventAccess && socketAccess && !socketIsAccessSubscribed && subscribeAccessEvent();
  }, [eventAccess, socketAccess]);

  if (loader) return <Loader/>;
  if (error) return <Error errorMsg={ACCESS_ERROR}/>;

  return (
    <div className="access-container">
      <div className="access-header">
        <GoBack route={`/events/${pathname.split("/")[2]}`}/>
        <h1>Access</h1>
        <EventActions event={eventAccess!} actions={{ filter: true, access: true, accessAccounts: true, scan: true, info: true, notifications: true }} setFilterState={setFilterState} filterState={filterState}/>
      </div>
      <EventFilters 
        filterState={filterState} 
        setFilterConfig={setFilterConfig}
      />
      <ColumnChart data={chartData} options={columnChartOptions}/>
      <AccessList eventAccessList={eventAccessList!}/>
    </div>
  );
}