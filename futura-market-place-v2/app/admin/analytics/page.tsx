'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Ticket, Eye, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAdminEvents, getAdminOrders } from '@/app/shared/services/services';
import type { EventAPI, Order, Item } from '@/app/shared/interface';

const COLORS = ['#00c8b3', '#FE3E01', '#8b5cf6', '#f59e0b', '#ec4899'];

interface EventAnalytics {
  _id: string;
  name: string;
  totalRevenue: number;
  ticketsSold: number;
  capacity: number;
  conversionRate: number;
  date: string;
  salesByDay: { date: string; sales: number; revenue: number }[];
  ticketsByType: { name: string; value: number; revenue: number }[];
}

export default function EventAnalytics() {
  const [events, setEvents] = useState<EventAnalytics[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [eventsData, ordersData] = await Promise.all([
        getAdminEvents(),
        getAdminOrders()
      ]);

      // Process analytics for each event
      const analyticsData: EventAnalytics[] = eventsData.map(event => {
        // Filter orders for this event
        // Type assertion needed due to interface mismatch between Order and OrderPayload
        type OrderWithItems = Order & { items: Item[]; event: EventAPI };
        const eventOrders = ordersData.filter(order =>
          (order.event as unknown as EventAPI)._id === event._id && order.status === 'SUCCEEDED'
        ) as unknown as OrderWithItems[];

        // Calculate total revenue
        const totalRevenue = eventOrders.reduce((sum, order) => {
          const orderTotal = order.items.reduce((itemSum, item) =>
            itemSum + (item.price * item.amount), 0
          );
          return sum + orderTotal;
        }, 0);

        // Calculate tickets sold
        const ticketsSold = eventOrders.reduce((sum, order) =>
          sum + order.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0
        );

        // Group tickets by type
        const ticketsByTypeMap = new Map<string, { value: number; revenue: number }>();
        eventOrders.forEach(order => {
          order.items.forEach(item => {
            const existing = ticketsByTypeMap.get(item.type) || { value: 0, revenue: 0 };
            ticketsByTypeMap.set(item.type, {
              value: existing.value + item.amount,
              revenue: existing.revenue + (item.price * item.amount)
            });
          });
        });

        const ticketsByType = Array.from(ticketsByTypeMap.entries()).map(([name, data]) => ({
          name,
          ...data
        }));

        // Group sales by day (last 30 days)
        const salesByDay = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          const dateStr = date.toISOString().split('T')[0];

          const dayOrders = eventOrders.filter(order =>
            order.createdAt?.toString().split('T')[0] === dateStr
          );

          const sales = dayOrders.reduce((sum, order) =>
            sum + order.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0
          );

          const revenue = dayOrders.reduce((sum, order) => {
            const orderTotal = order.items.reduce((itemSum, item) =>
              itemSum + (item.price * item.amount), 0
            );
            return sum + orderTotal;
          }, 0);

          return {
            date: `${date.getMonth() + 1}/${date.getDate()}`,
            sales,
            revenue
          };
        });

        return {
          _id: event._id,
          name: event.name,
          totalRevenue,
          ticketsSold,
          capacity: event.capacity,
          conversionRate: ticketsSold > 0 ? ((ticketsSold / event.capacity) * 100) : 0,
          date: new Date(event.dateTime.startDate).toISOString(),
          salesByDay,
          ticketsByType
        };
      });

      setEvents(analyticsData);
      if (analyticsData.length > 0) {
        setSelectedEvent(analyticsData[0]);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOccupancy = (sold: number, capacity: number) => {
    return ((sold / capacity) * 100).toFixed(1);
  };

  const avgTicketPrice = selectedEvent ? selectedEvent.totalRevenue / selectedEvent.ticketsSold : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-futura-teal mx-auto mb-4"></div>
              <p className="text-gray-400">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedEvent || events.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/admin" className="text-futura-teal hover:text-futura-teal/80 mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-futura-teal">Event Analytics</h1>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-400">No events found with sales data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-futura-teal hover:text-futura-teal/80 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-futura-teal">Event Analytics</h1>
          <p className="text-gray-400 mt-2">Detailed performance metrics for your events</p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Event</label>
          <Select
            value={selectedEvent._id}
            onValueChange={(id) => {
              const event = events.find(e => e._id === id);
              if (event) setSelectedEvent(event);
            }}
          >
            <SelectTrigger className="w-full md:w-96 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event._id} value={event._id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-400">€{selectedEvent.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-400 mt-2">Avg: €{avgTicketPrice.toFixed(2)}/ticket</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Ticket className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Tickets Sold</h3>
            <p className="text-3xl font-bold text-blue-400">{selectedEvent.ticketsSold.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-2">
              {calculateOccupancy(selectedEvent.ticketsSold, selectedEvent.capacity)}% occupancy
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-futura-teal/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-futura-teal" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Sell-through Rate</h3>
            <p className="text-3xl font-bold text-futura-teal">{selectedEvent.conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-2">
              {selectedEvent.capacity - selectedEvent.ticketsSold} remaining
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Sales Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedEvent.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', border: '1px solid #333' }} />
                <Line type="monotone" dataKey="sales" stroke="#00c8b3" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Revenue Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={selectedEvent.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', border: '1px solid #333' }} />
                <Bar dataKey="revenue" fill="#00c8b3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Tickets by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={selectedEvent.ticketsByType}
                  cx="50%"
                  cy="50%"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {selectedEvent.ticketsByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', border: '1px solid #333' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Revenue by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={selectedEvent.ticketsByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#888" />
                <YAxis type="category" dataKey="name" stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', border: '1px solid #333' }} />
                <Bar dataKey="revenue" fill="#00c8b3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Table */}
        <div className="mt-6 bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Ticket Type Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Sold</th>
                  <th className="text-left p-4">Revenue</th>
                  <th className="text-left p-4">Avg Price</th>
                  <th className="text-left p-4">% of Sales</th>
                </tr>
              </thead>
              <tbody>
                {selectedEvent.ticketsByType.map((type, index) => {
                  const avgPrice = type.revenue / type.value;
                  const percentOfTotal = (type.value / selectedEvent.ticketsSold) * 100;

                  return (
                    <tr key={index} className="border-t border-white/10 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="font-medium">{type.name}</span>
                        </div>
                      </td>
                      <td className="p-4">{type.value.toLocaleString()}</td>
                      <td className="p-4 text-green-400">€{type.revenue.toLocaleString()}</td>
                      <td className="p-4">€{avgPrice.toFixed(2)}</td>
                      <td className="p-4">{percentOfTotal.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
