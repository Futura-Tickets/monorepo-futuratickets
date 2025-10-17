"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// STATE
import { useGlobalState } from "@/components/GlobalStateProvider/GlobalStateProvider";

// ANTD
import Button from "antd/es/button";
import { RocketOutlined } from "@ant-design/icons";
import Modal from "antd/es/modal";

// SOCKET
import { socket } from "../../Socket";

// COMPONENTS
import ColumnChart from "@/shared/ColumnChart/ColumnChart";
import EventFilters from "../EventFilters/EventFilters";
import Error from "@/shared/Error/Error";
import EventActions from "../EventActions/EventActions";
import GoBack from "@/shared/GoBack/GoBack";
import Loader from "@/shared/Loader/Loader";
import ResaleList from "./ResaleList/ResaleList";

// SERVICES
import { enableResale, getEventResale } from "@/shared/services";

// UTILS
import { calculateDaysBetweenDates } from "@/shared/utils/utils";

// INTERFACES
import { EmitResale, Event, Order, Sale, TicketStatus, FilterConfig } from "@/shared/interfaces";

// STYLES
import "./Resale.scss";

// CONSTANTS
const RESALE_ERROR = "There was an error loading your data";

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
  colors: ['#006f94', '#333333'],
};

const initialChartData = [
  ["Day", "Listed", "Sold"],
  ['', 0, 0],
];

let socketIsResaleSubscribed = false;

export default function Resale() {

  const pathname = usePathname();
  const [state, dispatch] = useGlobalState();

  const [eventResale, setEventResaleState] = useState<Event>();
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [newResale, setNewResaleState] = useState<Sale>();

  const [chartData, setChartData] = useState<[[string, any, any]]>(initialChartData as any);
  const [filterState, setFilterState] = useState<boolean>(false);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    type: 'sales',
    status: '',
    search: ''
  });
  const [enableResaleModal, setEnableResaleModal] = useState<boolean>(false);
  const [disableResaleModal, setDisableResaleModal] = useState<boolean>(false);

  const [loader, setLoader] = useState<boolean>(false);
  const [modalLoader, setModalLoader] = useState<boolean>(false);
  const [error, setError] = useState<boolean>();

  const setEventResale = async(eventId: string): Promise<void> => {
    try {

        setLoader(true);

        const eventResale = await getEventResale(eventId);

        setEventResaleState(eventResale);
        setOrdersState(eventResale.orders);

        setLoader(false);

    } catch (error) {
      setError(true);
      setLoader(false);
    }
  };

  const calculateChartData = (orders: Order[]) => {
    const resaleTickets: Sale[] = [];
    orders.forEach((order: Order) => {
      order.sales.forEach((sale: Sale) => {
        if (sale.isResale === 'true' || sale.resale) {
          resaleTickets.push(sale);
        }
      });
    });

    if (resaleTickets.length === 0) {
      setChartData(initialChartData as any);
      return;
    }

    const resaleDates = resaleTickets.map(sale => {
      const date = sale.resale?.resaleDate ? new Date(sale.resale.resaleDate) : new Date(sale.createdAt);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });

    const minDate = new Date(Math.min(...resaleDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...resaleDates.map(d => d.getTime())));
    
    const days = calculateDaysBetweenDates(minDate, maxDate);
    const chartData: [[string, any, any]] = [["Day", "Listed", "Sold"]];
    
    const currentDate = new Date(minDate.getTime());
    for (let i = 0; i <= days; i++) {
      if (i > 0) currentDate.setDate(currentDate.getDate() + 1);
      chartData.push([`${currentDate.getDate()}/${currentDate.getMonth() + 1}`, 0, 0]);
    }

    resaleTickets.forEach((sale: Sale) => {
      const saleDate = sale.resale?.resaleDate ? new Date(sale.resale.resaleDate) : new Date(sale.createdAt);
      const saleParsedDate = `${saleDate.getDate()}/${saleDate.getMonth() + 1}`;

      chartData.forEach((data: [string, any, any]) => {
        if (data[0] === saleParsedDate) {
          if (sale.status === TicketStatus.SALE) {
            data[1] += 1; // Listed for resale
          } else if (sale.status === TicketStatus.SOLD || sale.status === TicketStatus.TRANSFERED) {
            data[2] += 1; // Sold/Transferred
          }
        }
      });
    });

    setChartData(chartData.length > 1 ? [...chartData] : initialChartData as any);
  };

  const subscribeResaleEvent = (): void => {

    console.log('Subscribed to resale!');

    socketIsResaleSubscribed = true;

    socket.on('ticket-resale', (value: EmitResale) => {

      if (eventResale?._id == value.event._id) {

        const newResale: Sale = {
          _id: value._id,
          order: value.order,
          event: {
            _id: value.event._id,
            name: value.event.name,
            address: value.event.address
          },
          client: {
            name: value.client.name,
            lastName: value.client.lastName,
            email: value.client.email
          },
          hash: value.hash ? value.hash : undefined,
          tokenId: value.tokenId ? value.tokenId : undefined,
          resale: {
            resalePrice: value.resale.resalePrice,
            resaleDate: value.resale.resaleDate
          },
          type: value.type,
          price: value.price,
          status: value.status,
          qrCode: value.qrCode,
          isResale: value.isResale,
          isTransfer: value.isTransfer,
          createdAt: value.createdAt
        };

        setNewResaleState(newResale);

      }
    });
  };

  const updateResaleList = (newSale: Sale): void => {

    const orderFound = orders.find((order: Order) => order._id == newSale.order);
    if (orderFound) {

      const updatedOrders = orders.map((order: Order) => {
        if (order._id == newSale.order) {
          order.sales = order.sales.map((sale: Sale) => {
            if (sale._id == newSale._id) return newSale;
            return sale;
          });
          return order;
        }
        return order
      });

      setOrdersState(updatedOrders!);
      calculateChartData(updatedOrders!);

      return;

    }
  };

  const setEnableResale = async (event: string): Promise<void> => {
    try {

      setModalLoader(true);

      await enableResale(event, true);
      setEventResaleState({ ...eventResale, resale: { ...eventResale?.resale, isActive: true }} as Event);

      setModalLoader(false);
      handleEnableResaleCancel();

    } catch (error) {
      setModalLoader(false);
      handleEnableResaleCancel();
    }
  };

  const setDisableResale = async (event: string): Promise<void> => {
    try {

      setModalLoader(true);

      await enableResale(event, false);
      setEventResaleState({ ...eventResale, resale: { ...eventResale?.resale, isActive: false }} as Event);

      setModalLoader(false);
      handleDisableResaleCancel();

    } catch (error) {
      setModalLoader(false);
      handleDisableResaleCancel();
    }
  };

  const handleEnableResaleCancel = (): void => {
    setEnableResaleModal(false);
  };

  const handleDisableResaleCancel = (): void => {
    setDisableResaleModal(false);
  };

  useEffect(() => {
    const eventId = pathname.split("/")[2];
    eventId && setEventResale(eventId);
    state.goBackRoute && dispatch({ goBackRoute: undefined });
  }, []);

  useEffect(() => {
    eventResale && eventResale.resale.isActive && calculateChartData(eventResale.orders);
  }, [eventResale]);

  useEffect(() => {
    eventResale && eventResale.resale.isActive && socket && !socketIsResaleSubscribed && subscribeResaleEvent();
  }, [eventResale, socket]);
  
  useEffect(() => {
    newResale && updateResaleList(newResale);
  }, [newResale]);

  if (loader) return <Loader/>;
  if (error) return <Error errorMsg={RESALE_ERROR}/>;

  return (
    <>
      <div className="resale-container">
        <div className="resale-header">
          <GoBack route={`/events/${pathname.split("/")[2]}`}/>
          <h1>Resale</h1>
          <EventActions event={eventResale!} actions={{ launch: true, filter: true, enableResale: true, resale: true, info: true, notifications: true }} setFilterState={setFilterState} setEnableResaleModal={setEnableResaleModal} setDisableResaleModal={setDisableResaleModal} filterState={filterState}/>
        </div>
        <EventFilters 
          filterState={filterState} 
          setFilterConfig={setFilterConfig}
        />
        <ColumnChart data={chartData} options={columnChartOptions}/>
        {!eventResale?.resale.isActive && <ResaleNotActive setEnableResaleModal={setEnableResaleModal}/>}
        {eventResale?.resale.isActive && <ResaleList resaleList={eventResale?.orders! || []} filterConfig={filterConfig}/>}
      </div>
      <Modal title={null} open={enableResaleModal} onCancel={handleEnableResaleCancel} closable={!modalLoader} footer={null} mask={true} centered>
        <div className="event-resale-modal-container">
          <div className="event-resale-modal-content">
            <h1><RocketOutlined /> Enable resale</h1>
            <p>Enable resale to allow your customers to resale their tickets.</p>
            <div>
              <Button size="large" className="save-event-btn" type="primary" onClick={() => setEnableResale(pathname.split("/")[2])} loading={modalLoader}>
                Enable resale
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal title={null} open={disableResaleModal} onCancel={handleDisableResaleCancel} closable={!modalLoader} footer={null} mask={true} centered>
        <div className="event-resale-modal-container">
          <div className="event-resale-modal-content">
            <h1><RocketOutlined /> Disable resale</h1>
            <p>Disable the resale will not allow your customers to resale their tickets.</p>
            <div>
              <Button size="large" className="save-event-btn" type="primary" onClick={() => setDisableResale(pathname.split("/")[2])} loading={modalLoader}>
                Disable resale
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function ResaleNotActive({ setEnableResaleModal }: { setEnableResaleModal: Dispatch<SetStateAction<boolean>> }) {
  return (
    <div className="resale-not-active-container">
      <div className="resale-not-active-content">
        <h2>Resale not active</h2>
        <p>Enable the resable to allow your customers to resale their tickets into the event page.</p>
        <Button size="large" type="primary" onClick={() => setEnableResaleModal(true)}>
          <RocketOutlined/>Enable Resale
        </Button>
      </div>
    </div>
  )
}