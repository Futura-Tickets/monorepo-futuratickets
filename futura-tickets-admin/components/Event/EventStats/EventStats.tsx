"use client";
import { useEffect, useState } from "react";

// ANTD
import { CalendarOutlined, EuroCircleOutlined, RiseOutlined, TagsOutlined, TeamOutlined, RocketOutlined } from "@ant-design/icons";

// STATE
import { useGlobalState } from "../../GlobalStateProvider/GlobalStateProvider";

// INTERFACES
import { Account, Event, Order, Sale, TicketStatus } from "@/shared/interfaces";

// STYLES
import "./EventStats.scss";

interface EventStatsProps {
  event: Event;
  orders: Order[];
}

export default function EventStats({ event, orders }: EventStatsProps) {
  
  const [ticketsSold, setTicketsSold] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [daysToEvent, setDaysToEvent] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(0);
  const [clients, setClientsState] = useState<number>(0);
  const [launchDate, setLaunchDate] = useState<string>("");
  
  const calculateEventStats = (): void => {
    if (!event) return;
    
    let ticketsSold = 0;
    let totalRevenue = 0;
    let pendingTickets = 0;
    let totalClients: string[] = [];
    
    if (orders && orders.length > 0) {
      orders.forEach((order: Order) => {
      const clientId = (order.account as any as Account)?._id;
      if (clientId && !totalClients.includes(clientId)) {
        totalClients.push(clientId);
      }
      
      if (order.sales && order.sales.length > 0) {
        order.sales.forEach((sale: Sale) => {
          if (sale.status === TicketStatus.PENDING) {
            pendingTickets += 1;
          }
          
          if (sale.status === TicketStatus.OPEN || 
              sale.status === TicketStatus.SALE || 
              sale.status === TicketStatus.SOLD ||
              sale.status === TicketStatus.CLOSED || 
              sale.status === TicketStatus.EXPIRED) {
            ticketsSold += 1;
            totalRevenue += sale.price;
          }
        });
      }
      });
    }
    
    setTicketsSold(ticketsSold);
    setTotalRevenue(totalRevenue);
    setClientsState(totalClients.length);
    setConversionRate(Number(((ticketsSold / (ticketsSold + pendingTickets)) * 100).toFixed(1)) || 0);
  };
  
  const calculateDaysToEvent = (): void => {
    if (!event?.dateTime?.startDate) return;
    
    const daysDifference = (new Date(event.dateTime.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    setDaysToEvent(Math.ceil(daysDifference));
  };
  
  const formatLaunchDate = (): void => {
    if (!event?.dateTime?.launchDate) return;
    
    const date = new Date(event.dateTime.launchDate);
    setLaunchDate(`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`);
  };
  
  useEffect(() => {
    calculateEventStats();
    calculateDaysToEvent();
    formatLaunchDate();
  }, [event, orders]);
  
  return (
    <div className="event-stats-container">
      <div className="event-stats">
        <div className="event-stat">
          <span>TOTAL REVENUE <EuroCircleOutlined /></span>
          {totalRevenue} EUR
        </div>
        
        <div className="event-stat">
          <span>TICKETS SOLD <TagsOutlined /></span>
          {ticketsSold}
        </div>
        
        <div className="event-stat">
          <span>CONVERSION RATE <RiseOutlined /></span>
          {conversionRate}%
        </div>
        
        <div className="event-stat">
          <span>TOTAL CLIENTS <TeamOutlined /></span>
          {clients}
        </div>
        
        <div className="event-stat">
          <span>{!launchDate ? "LAUNCH STATUS" : "LAUNCH DATE"} <CalendarOutlined /></span>
          {event?.status === 'LIVE' ? (
            <span className="live-status">
              <RocketOutlined /> LIVE!
            </span>
          ) : (
            <>
              {launchDate || "Not launched"}
              {!launchDate && daysToEvent >= 0 && event?.status !== 'CLOSED' && (
                <div className="days-to-event">
                  {daysToEvent > 0 ? `(${daysToEvent} days to event)` : "(Event is today!)"}
                </div>
              )}
            </>
          )}
        </div>
        
        {(daysToEvent >= 0 && event?.status !== 'CLOSED' && event?.status !== 'LIVE' && launchDate) && (
          <div className="event-stat">
            <span>Days to Event <CalendarOutlined /></span>
            {daysToEvent > 0 && daysToEvent}
            {daysToEvent === 0 && (
              <span className="today">TODAY</span>
            )}
          </div>
        )}
        
        {event?.status === 'CLOSED' && (
          <div className="event-stat">
            <span>Status <CalendarOutlined /></span>
            {event.status}
          </div>
        )}
      </div>
    </div>
  );
}