'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// SOCKET
import { socket } from '../Socket';
import { socketMarketPlace } from '../SocketMarketPlace';

// ANTD
import Modal from 'antd/es/modal';
import Button from 'antd/es/button';
import { ExportOutlined, RocketOutlined } from '@ant-design/icons';

// COMPONENTS
import Error from '@/shared/Error/Error';
import EventActions from './EventActions/EventActions';
import EventFilters from './EventFilters/EventFilters';
import EventOrdersList from './EventOrdersList/EventOrdersList';
import EventSalesList from './EventSalesList/EventSalesList';
import GoBack from '@/shared/GoBack/GoBack';
import Loader from '@/shared/Loader/Loader';
import EventStats from './EventStats/EventStats';

// SERVICES
import { getEvent, launchEvent, getOrder } from '@/shared/services';

// UTILS
import { calculateDaysBetweenDates } from '@/shared/utils/utils';

// INTERACES
import {
  Event as IEvent,
  Order,
  Sale,
  DateTime,
  TicketStatus,
  EventStatus,
  FilterConfig
} from '@/shared/interfaces';

// STYLES
import './Event.scss';
import ColumnChart from '@/shared/ColumnChart/ColumnChart';

// CONSTANTS
const EVENT_ERROR = 'There was an error loading your Event';
const MINT_EVENT_ERROR = 'There was en error minting your Event';

let socketIsOrderSubscribed = false;
let socketMarketPlaceIsSubscribed = false;
let socketIsSaleSubscribed = false;
let socketIsResaleSubscribed = false;
let socketIsTransferSubscribed = false;

const columnChartOptions = {
  height: 280,
  backgroundColor: '#fff',
  legend: { position: 'none' },
  chartArea: {
    width: '100%',
    height: '100%',
    left: 30,
    right: 30,
    top: 20,
    bottom: 30,
    stroke: '#fff',
    strokeWidth: 0,
  },
  hAxis: {
    height: 100,
    minTextSpacing: 20,
    textStyle: {
      color: '#999',
      fontName: 'Arial',
      fontSize: 10,
      bold: false,
      italic: false,
    },
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
  bar: { groupWidth: '70%' },
  colors: ['#049b92'],
};

const initialChartData = [
  ['Month', 'Sales'],
  ['', 0],
];

export default function Event() {

  const pathname = usePathname();


  const [eventLaunchModal, setEventLaunchModal] = useState<boolean>(false);

  const [daysToEvent, setDaysToEvent] = useState<number>(0);

  const [event, setEventState] = useState<IEvent>();
  const [orders, setOrdersState] = useState<Order[]>([]);

  const [newOrder, setNewOrderState] = useState<Order>();
  const [newResale, setNewResaleState] = useState<Order>();
  const [newSale, setNewSaleState] = useState<Order>();
  const [newTransfer, setNewTransferState] = useState<Order>();

  const [chartData, setChartData] = useState<[[string, any, any]]>(initialChartData as any);
  const [loader, setLoader] = useState<boolean>(true);
  const [filterState, setFilterState] = useState<boolean>(false);
  const [modalLoader, setModalLoader] = useState<boolean>(false);

  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    type: 'sales',
    status: '',
    search: ''
  });

  const [error, setError] = useState<boolean>();
  const [errorMsg, setErrorMsg] = useState<string>();

  const goTo = (route: string): void => {
    window.open(`${process.env.NEXT_PUBLIC_MARKET_PLACE}/events/${route}`, '_blank');
  };

  const setEvent = async (eventId: string): Promise<void> => {
    try {

      setLoader(true);

      const event = await getEvent(eventId);
      setEventState(event);

      setOrdersState(event.orders);

      setLoader(false);
      
    } catch (error) {
      setErrorMsg(EVENT_ERROR);
      setError(true);
      setLoader(false);
    }
  };

  const calculateChartData = (launchDate: Date, endDate: Date, orders: Order[]) => {
    if (!launchDate || !endDate) return;

    // Month names for display
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate chart data for the last 12 months
    const chartData: [[string, any]] = [['Month', 'Sales']];
    const monthsMap = new Map<string, number>();
    
    // Get current date and calculate last 12 months
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Create entries for the last 12 months (including current month)
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      const displayName = monthNames[monthDate.getMonth()];
      monthsMap.set(monthKey, 0);
    }

    // Process orders and group by month
    if (orders && orders.length > 0) {
      orders.forEach((order: Order) => {
        if (order.sales && order.sales.length > 0) {
          order.sales.forEach((sale: Sale) => {
            if (!sale.createdAt) return;
            
            if (sale.status === TicketStatus.OPEN || 
                sale.status === TicketStatus.SALE || 
                sale.status === TicketStatus.SOLD ||
                sale.status === TicketStatus.CLOSED || 
                sale.status === TicketStatus.EXPIRED) {
              
              const saleDate = new Date(sale.createdAt);
              const monthKey = `${saleDate.getFullYear()}-${saleDate.getMonth()}`;
              
              // Only count sales from the last 12 months
              if (monthsMap.has(monthKey)) {
                monthsMap.set(monthKey, monthsMap.get(monthKey)! + 1);
              }
            }
          });
        }
      });
    }

    // Convert map to chart data array with month names
    const sortedEntries = Array.from(monthsMap.entries()).sort((a, b) => {
      const [yearA, monthA] = a[0].split('-').map(Number);
      const [yearB, monthB] = b[0].split('-').map(Number);
      
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    sortedEntries.forEach(([key, value]) => {
      const [year, month] = key.split('-').map(Number);
      const displayName = monthNames[month];
      chartData.push([displayName, value]);
    });

    setChartData(chartData.length > 1 ? [...chartData] : (initialChartData as any));

  };

  const launch = async (eventId: string): Promise<void> => {
    try {

      setModalLoader(true);

      const dateTime: DateTime = {
        launchDate: new Date(),
        startDate: event?.dateTime.startDate!,
        endDate: event?.dateTime.endDate!,
      };

      await launchEvent(eventId, dateTime);

      setEventState({ ...event!, status: EventStatus.LAUNCHED });
      setModalLoader(false);
      setEventLaunchModal(false);

    } catch (error) {

      setErrorMsg(MINT_EVENT_ERROR);
      setError(true);

      setModalLoader(false);
      setEventLaunchModal(false);
    }
  };

  const handleEventMintCancel = (): void => {
    setEventLaunchModal(false);
  };

  const subscribeOrderEvent = (): void => {
    console.log('Subscribed to order!');

    socketIsOrderSubscribed = true;

    socket.on('order-created', async (orderId: string) => {
      try {
        const orderDetails = await getOrder(orderId);
        
        if (orderDetails && orderDetails.event === event?._id) {
          setNewOrderState(orderDetails);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    });
  };

  const subscribeResaleEvent = (): void => {
    socketIsResaleSubscribed = true;
    
    socket.on('ticket-resale', async (orderId: string) => {
      try {
        const orderDetails = await getOrder(orderId);
        
        if (orderDetails && orderDetails.event === event?._id) {
          setNewResaleState(orderDetails);
        }
      } catch (error) {
        console.error('Error fetching resale notification:', error);
      }
    });
  };

  const subscribeTransferEvent = (): void => {

    socketIsTransferSubscribed = true;
    
    socket.on('transfer-created', async (orderId: string) => {
      try {

        const orderDetails = await getOrder(orderId);
        
        if (orderDetails && orderDetails.event === event?._id) {
          setNewTransferState(orderDetails);
        }
      } catch (error) {
        console.error('Error fetching order notification:', error);
      }
    });
  };

  const subscribeSocketMarketPlace = (): void => {
    console.log('Subscribed to market place order!');

    socketMarketPlaceIsSubscribed = true;

    socketMarketPlace.on('order-created', async (orderId: string) => {
      try {
        const orderDetails = await getOrder(orderId);
        if (orderDetails && orderDetails.event === event?._id) {
          setNewOrderState(orderDetails);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    });
  };

  const subscribeSaleEvent = (): void => {
    console.log('Subscribed to sale!');
  
    socketIsSaleSubscribed = true;
  
    socket.on('ticket-minted', async (orderId: string) => {
      console.log('New ticket minted!');
      
      try {
        const orderDetails = await getOrder(orderId);
        
        if (orderDetails && orderDetails.event === event?._id) {
          setNewSaleState(orderDetails);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    });
  };

  const updateOrderList = (newOrder: Order): void => {
    const orderFound = orders.find((order: Order) => order._id == newOrder._id);
    if (orderFound) {
      const updatedOrders = orders.map((order: Order) => {
        if (order._id == newOrder._id) return newOrder;
        return order;
      });

      setOrdersState(updatedOrders!);
      calculateChartData(event?.dateTime.launchDate!, event?.dateTime.endDate!, updatedOrders!);

      return;

    }

    setOrdersState([newOrder, ...orders]);
    calculateChartData(event?.dateTime.launchDate!, event?.dateTime.endDate!, [newOrder, ...orders]);

  };

  const updateSaleList = (newOrder: Order): void => {
    const orderFound = orders.find((order: Order) => order._id == newOrder._id);
    if (orderFound) {
      const updatedOrders = orders.map((order: Order) => {
        if (order._id == newOrder._id) {
          order.sales = order.sales.map((sale: Sale) => {
            const saleFound = newOrder.sales.find((newOrderSale: Sale) => newOrderSale._id == sale._id)
            if (saleFound) return saleFound;
            return sale;
          });
          return order;
        }
        return order;
      });

      setOrdersState(updatedOrders!);
      calculateChartData(event?.dateTime.launchDate!, event?.dateTime.endDate!, updatedOrders!);

      return;
    }

    setOrdersState([newOrder, ...orders]);
    calculateChartData(event?.dateTime.launchDate!, event?.dateTime.endDate!, [newOrder, ...orders]);
  };

  const updateResaleList = (newOrder: Order): void => {
    const orderFound = orders.find((order: Order) => order._id == newOrder._id);
    if (orderFound) {
      const updatedOrders = orders.map((order: Order) => {
        if (order._id == newOrder._id) {
          order.sales = order.sales.map((sale: Sale) => {
            if (sale._id == newOrder.sales[0]._id) return newOrder.sales[0];
            return sale;
          });
          return order;
        }
        return order;
      });

      setOrdersState(updatedOrders!);
      calculateChartData(event?.dateTime.launchDate!, event?.dateTime.endDate!, updatedOrders!);

      return;

    }
  };

  const updateTransferList = (newTransfer: Order): void => {
    const orderFound = orders.find((order: Order) => order._id == newTransfer._id);
    if (orderFound) {
      const updatedOrders = orders.map((order: Order) => {
        if (order._id == newTransfer._id) {
          order.sales = order.sales.map((sale: Sale) => {
            if (sale._id == newTransfer.sales[0]._id) return newTransfer.sales[0];
            return sale;
          });
          return order;
        }
        return order;
      });

      setOrdersState(updatedOrders!);
      calculateChartData(event?.dateTime.launchDate!, event?.dateTime.endDate!, updatedOrders!);

      return;

    }
  };

  const calculateDaysToEvent = (startDate: Date): void => {
    const daysDifference =(new Date(startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    setDaysToEvent(Math.ceil(daysDifference));
  };

  const getFilteredSales = () => {
    let filteredOrders = [...orders];
    
    if (filterConfig.search) {
      const searchTerms = filterConfig.search.toLowerCase().trim().split(/\s+/).filter(term => term.length > 0);
      
      filteredOrders = filteredOrders.filter(order => {
        const account = order.account as any;
        const orderText = [
          order._id,
          `${account?.name || ''} ${account?.lastName || ''}`,
          order.contactDetails?.email || account?.email || '',
          order.status,
          new Date(order.createdAt).toLocaleDateString()
        ].join(' ').toLowerCase();
        
        return searchTerms.every(term => orderText.includes(term));
      });
    }

    if (filterConfig.status) {
      filteredOrders = filteredOrders.map(order => {
        return {
          ...order,
          sales: order.sales.filter(sale => sale.status === filterConfig.status)
        };
      }).filter(order => order.sales.length > 0);
    }
    
    return filteredOrders;
  };

  const getFilteredOrders = () => {
    let filteredOrders = [...orders];
    
    if (filterConfig.search) {
      const searchTerms = filterConfig.search.toLowerCase().trim().split(/\s+/).filter(term => term.length > 0);
      
      filteredOrders = filteredOrders.filter(order => {
        const account = order.account as any;
        const orderText = [
          order._id || '',
          `${account?.name || ''} ${account?.lastName || ''}`,
          order.contactDetails?.email || account?.email || '',
          order.status || '',
          new Date(order.createdAt).toLocaleDateString()
        ].join(' ').toLowerCase();
        
        return searchTerms.every(term => orderText.includes(term));
      });
    }

    if (filterConfig.status && filterConfig.status.trim() !== '') {
      filteredOrders = filteredOrders.filter(order => {
        const matches = order.status && order.status.toUpperCase() === filterConfig.status.toUpperCase();
        return matches;
      });
    }
    
    return filteredOrders;
  };

  const getFilteredData = () => {
    if (filterConfig.type === 'sales') {
      return getFilteredSales();
    } else {
      return getFilteredOrders();
    }
  };

  useEffect(() => {
    const eventId = pathname.split('/')[2];
    if (eventId) {
      setEvent(eventId);
    }
  }, []);

  useEffect(() => {
    if (event?.dateTime) {
      // Use launchDate if available, otherwise use startDate for chart calculation
      const chartStartDate = event.dateTime.launchDate || event.dateTime.startDate;
      const chartEndDate = event.dateTime.endDate;
      
      if (chartStartDate && chartEndDate) {
        calculateChartData(chartStartDate, chartEndDate, orders);
      }
      
      if (event.dateTime.startDate) {
        calculateDaysToEvent(event.dateTime.startDate);
      }
    }
  }, [filterConfig, event, orders]);

  useEffect(() => {
    if (event && socketMarketPlace && !socketMarketPlaceIsSubscribed) {
      console.log('Subscribing to market place socket ...');
      subscribeSocketMarketPlace();
    }
    
    if (event && socket) {
      if (!socketIsOrderSubscribed) subscribeOrderEvent();
      if (!socketIsSaleSubscribed) subscribeSaleEvent();
      if (!socketIsResaleSubscribed) subscribeResaleEvent();
      if (!socketIsTransferSubscribed) subscribeTransferEvent();
    }
  }, [event, socket, socketMarketPlace]);

  useEffect(() => {
    newOrder && updateOrderList(newOrder);
  }, [newOrder]);

  useEffect(() => {
    newSale && updateSaleList(newSale);
  }, [newSale]);

  useEffect(() => {
    newResale && updateResaleList(newResale);
  }, [newResale]);

  useEffect(() => {
    newTransfer && updateTransferList(newTransfer);
  }, [newTransfer]);

  if (loader) return <Loader />;
  if (error) return <Error errorMsg={EVENT_ERROR} />;

  return (
    <>
      <div className="event-container">
        <div className={`event-header ${filterState ? "filter-active" : ""}`}>
          <GoBack route="/events"/>
          <h1>{event?.name} <ExportOutlined onClick={() => goTo(event?.url!)}/></h1>
          <EventActions event={event!} actions={{ launch: true, filter: true, access: true, accessAccounts: false, resale: true, info: true, invitations: true, export: true, notifications: true }} setFilterState={setFilterState} setEventLaunchModal={setEventLaunchModal} filterState={filterState}/>
        </div>
        <EventFilters 
          filterState={filterState} 
          setFilterConfig={setFilterConfig}
        />
        <EventStats event={event!} orders={orders} />
        
        <ColumnChart data={chartData} options={columnChartOptions}/>
        {!event?.dateTime && (
          <div className="dashboard-content not-found">
            <h2>Launch Event</h2>
            <Button onClick={() => setEventLaunchModal(true)} size="large">Launch</Button>
          </div>
        )}
        {filterConfig.type == 'sales' && <EventSalesList orders={getFilteredData()}/>}
        {filterConfig.type == 'orders' && <EventOrdersList orders={getFilteredData()}/>}
      </div>
      <Modal
        title={null}
        open={eventLaunchModal}
        onCancel={handleEventMintCancel}
        closable={!modalLoader}
        footer={null}
        mask={true}
        centered
      >
        <div className='event-mint-modal-container'>
          <div className='event-mint-modal-content'>
            <h1>
              <RocketOutlined /> Launch Event
            </h1>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </p>
            <Button
              size='large'
              className='save-event-btn'
              type='primary'
              onClick={() => launch(pathname.split('/')[2])}
              loading={modalLoader}
            >
              Launch Event
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
