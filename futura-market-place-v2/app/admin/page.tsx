'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminEvents, getAdminPromoters, getAdminOrders } from '@/app/shared/services/services';
import { EventAPI, Order } from '@/app/shared/interface';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Promoter {
  _id: string;
  name: string;
  email?: string;
}

export default function AdminDashboard() {
  const { userData, isLoggedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalPromoters: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentEvents: [] as EventAPI[],
    pendingOrders: 0,
    successfulOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    todayOrders: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    salesByDay: [] as Array<{ date: string; revenue: number; orders: number }>,
    topEvents: [] as Array<{ name: string; revenue: number; tickets: number }>,
    salesByPromoter: [] as Array<{ name: string; revenue: number; percentage: number }>,
    revenueGrowth: 0,
    ordersGrowth: 0,
  });

  useEffect(() => {
    if (!isLoggedIn || userData?.role !== 'ADMIN') {
      router.push('/');
    } else {
      loadDashboardData();
    }
  }, [isLoggedIn, userData, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [events, promoters, orders] = await Promise.all([
        getAdminEvents().catch(() => []),
        getAdminPromoters().catch(() => []),
        getAdminOrders().catch(() => []),
      ]);

      // Helper function to calculate order total
      const calculateOrderTotal = (order: Order) => {
        const itemsTotal = order.items?.reduce((s, item) => s + (item.price * item.amount), 0) || 0;
        const resaleItemsTotal = order.resaleItems?.reduce((s, item) => s + (item.price * item.amount), 0) || 0;
        return itemsTotal + resaleItemsTotal;
      };

      // Filter successful orders
      const successfulOrders = orders.filter((order: Order) => order.status === 'SUCCEEDED');
      const pendingOrders = orders.filter((order: Order) => order.status === 'PENDING');

      // Calculate total revenue
      const totalRevenue = successfulOrders.reduce((sum: number, order: Order) => sum + calculateOrderTotal(order), 0);

      // Calculate average order value
      const averageOrderValue = successfulOrders.length > 0 ? totalRevenue / successfulOrders.length : 0;

      // Calculate conversion rate (successful orders / total orders)
      const conversionRate = orders.length > 0 ? (successfulOrders.length / orders.length) * 100 : 0;

      // Get time-based stats
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const todayOrders = successfulOrders.filter((order: Order) =>
        order.createdAt && new Date(order.createdAt) >= todayStart
      );
      const weekOrders = successfulOrders.filter((order: Order) =>
        order.createdAt && new Date(order.createdAt) >= weekStart
      );
      const monthOrders = successfulOrders.filter((order: Order) =>
        order.createdAt && new Date(order.createdAt) >= monthStart
      );
      const lastMonthOrders = successfulOrders.filter((order: Order) =>
        order.createdAt && new Date(order.createdAt) >= lastMonthStart && new Date(order.createdAt) <= lastMonthEnd
      );

      const todayRevenue = todayOrders.reduce((sum, o) => sum + calculateOrderTotal(o), 0);
      const weekRevenue = weekOrders.reduce((sum, o) => sum + calculateOrderTotal(o), 0);
      const monthRevenue = monthOrders.reduce((sum, o) => sum + calculateOrderTotal(o), 0);
      const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + calculateOrderTotal(o), 0);

      // Calculate growth percentages
      const revenueGrowth = lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
      const ordersGrowth = lastMonthOrders.length > 0 ? ((monthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 : 0;

      // Sales by day (last 30 days)
      const salesByDay: Array<{ date: string; revenue: number; orders: number }> = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        const dayOrders = successfulOrders.filter((order: Order) => {
          const orderDate = order.createdAt ? new Date(order.createdAt) : null;
          return orderDate && orderDate >= dayStart && orderDate < dayEnd;
        });

        const dayRevenue = dayOrders.reduce((sum, o) => sum + calculateOrderTotal(o), 0);

        salesByDay.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          revenue: parseFloat(dayRevenue.toFixed(2)),
          orders: dayOrders.length,
        });
      }

      // Top 5 events by revenue
      const eventRevenue = new Map<string, { name: string; revenue: number; tickets: number }>();
      successfulOrders.forEach((order: Order) => {
        const eventName = typeof order.event === 'object' && order.event !== null ? order.event.name : 'Unknown Event';
        const revenue = calculateOrderTotal(order);
        const tickets = (order.items?.reduce((sum, item) => sum + item.amount, 0) || 0) +
                       (order.resaleItems?.reduce((sum, item) => sum + item.amount, 0) || 0);

        const existing = eventRevenue.get(eventName) || { name: eventName, revenue: 0, tickets: 0 };
        eventRevenue.set(eventName, {
          name: eventName,
          revenue: existing.revenue + revenue,
          tickets: existing.tickets + tickets,
        });
      });
      const topEvents = Array.from(eventRevenue.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(e => ({ ...e, revenue: parseFloat(e.revenue.toFixed(2)) }));

      // Sales by promoter
      const promoterRevenue = new Map<string, number>();
      successfulOrders.forEach((order: Order) => {
        // Try to get promoter from event
        let promoterName = 'Unknown Promoter';
        if (typeof order.event === 'object' && order.event !== null) {
          if (typeof order.event.promoter === 'object' && order.event.promoter !== null) {
            promoterName = order.event.promoter.name || 'Unknown Promoter';
          }
        }

        const revenue = calculateOrderTotal(order);
        promoterRevenue.set(promoterName, (promoterRevenue.get(promoterName) || 0) + revenue);
      });

      const salesByPromoter = Array.from(promoterRevenue.entries())
        .map(([name, revenue]) => ({
          name,
          revenue: parseFloat(revenue.toFixed(2)),
          percentage: parseFloat(((revenue / totalRevenue) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Get recent events (last 5)
      const recentEvents = events
        .sort((a: EventAPI, b: EventAPI) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);

      setStats({
        totalEvents: events.length,
        totalPromoters: promoters.length,
        totalOrders: orders.length,
        totalRevenue,
        recentEvents,
        pendingOrders: pendingOrders.length,
        successfulOrders: successfulOrders.length,
        averageOrderValue,
        conversionRate,
        todayOrders: todayOrders.length,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        salesByDay,
        topEvents,
        salesByPromoter,
        revenueGrowth,
        ordersGrowth,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn || userData?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-futura-teal">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Welcome back, {userData.name}! Here's your marketplace overview.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-futura-teal"></div>
          </div>
        ) : (
          <>
            {/* Enhanced KPI Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm">Total Revenue</h3>
                  <div className={`text-xs font-semibold ${stats.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueGrowth).toFixed(1)}%
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-400">€{stats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">Today: €{stats.todayRevenue.toFixed(2)}</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm">Total Orders</h3>
                  <div className={`text-xs font-semibold ${stats.ordersGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.ordersGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.ordersGrowth).toFixed(1)}%
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-400">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.successfulOrders} successful, {stats.pendingOrders} pending
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
                <h3 className="text-gray-400 text-sm mb-2">Avg Order Value</h3>
                <p className="text-3xl font-bold text-futura-teal">€{stats.averageOrderValue.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">Per successful order</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
                <h3 className="text-gray-400 text-sm mb-2">Conversion Rate</h3>
                <p className="text-3xl font-bold text-blue-400">{stats.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-2">Orders completed</p>
              </div>
            </div>

            {/* Time-based Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-futura-teal/20 to-futura-teal/5 border border-futura-teal/30 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">Today's Revenue</h3>
                <p className="text-2xl font-bold text-futura-teal">€{stats.todayRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">{stats.todayOrders} orders today</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">This Week</h3>
                <p className="text-2xl font-bold text-blue-400">€{stats.weekRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">This Month</h3>
                <p className="text-2xl font-bold text-purple-400">€{stats.monthRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">Current month</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-futura-teal">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  href="/admin/events"
                  className="bg-gradient-to-br from-futura-teal/20 to-futura-teal/5 border border-futura-teal/30 rounded-lg p-6 hover:from-futura-teal/30 hover:to-futura-teal/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Manage Events</h3>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">View, create and edit all events in the system</p>
                  <div className="text-futura-teal font-semibold text-sm">
                    View all {stats.totalEvents} events →
                  </div>
                </Link>

                <Link
                  href="/admin/promoters"
                  className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-lg p-6 hover:from-blue-500/30 hover:to-blue-500/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Manage Promoters</h3>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Create and manage promoter accounts</p>
                  <div className="text-blue-400 font-semibold text-sm">
                    View all {stats.totalPromoters} promoters →
                  </div>
                </Link>

                <Link
                  href="/admin/orders"
                  className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-lg p-6 hover:from-purple-500/30 hover:to-purple-500/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">View Orders</h3>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Monitor all orders and transactions</p>
                  <div className="text-purple-400 font-semibold text-sm">
                    View all {stats.totalOrders} orders →
                  </div>
                </Link>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-futura-teal">Analytics & Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Chart */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Revenue Trend (Last 30 Days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.salesByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 10, 10, 0.95)',
                          border: '1px solid rgba(0, 200, 179, 0.3)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#00c8b3' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#00c8b3" strokeWidth={2} name="Revenue (€)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Orders Chart */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Orders Trend (Last 30 Days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.salesByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 10, 10, 0.95)',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#a855f7' }}
                      />
                      <Legend />
                      <Bar dataKey="orders" fill="#a855f7" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Events and Promoters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Events */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Top 5 Events by Revenue</h3>
                  {stats.topEvents.length > 0 ? (
                    <div className="space-y-4">
                      {stats.topEvents.map((event, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                              <div className="flex-1">
                                <p className="font-medium text-sm truncate">{event.name}</p>
                                <p className="text-xs text-gray-400">{event.tickets} tickets sold</p>
                              </div>
                            </div>
                            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-futura-teal to-green-400"
                                style={{
                                  width: `${(event.revenue / stats.topEvents[0].revenue) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <p className="text-lg font-bold text-green-400">€{event.revenue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No data available</p>
                  )}
                </div>

                {/* Sales by Promoter */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Revenue by Promoter</h3>
                  {stats.salesByPromoter.length > 0 ? (
                    <div className="space-y-4">
                      {stats.salesByPromoter.map((promoter, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">{promoter.name}</p>
                              <span className="text-xs text-gray-400">{promoter.percentage}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-300"
                                style={{ width: `${promoter.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-bold text-blue-400">€{promoter.revenue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Events */}
            {stats.recentEvents.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-futura-teal">Recent Events</h2>
                  <Link href="/admin/events" className="text-futura-teal hover:text-futura-teal/80 text-sm">
                    View all →
                  </Link>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="text-left p-4">Event Name</th>
                        <th className="text-left p-4">Venue</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentEvents.map((event) => (
                        <tr key={event._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-medium">{event.name}</td>
                          <td className="p-4 text-gray-400">{event.location?.venue || '-'}</td>
                          <td className="p-4 text-gray-400">
                            {event.dateTime?.startDate
                              ? new Date(event.dateTime.startDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : '-'
                            }
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                event.status === 'LIVE'
                                  ? 'bg-green-500/20 text-green-400'
                                  : event.status === 'LAUNCHED'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : event.status === 'CREATED'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {event.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-400">{event.capacity || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Status */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="text-sm font-medium">Marketplace API</div>
                    </div>
                    <div className="text-xs text-green-400">Operational</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="text-sm font-medium">Payment Gateway</div>
                    </div>
                    <div className="text-xs text-green-400">Operational</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="text-sm font-medium">Database</div>
                    </div>
                    <div className="text-xs text-green-400">Operational</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Platform Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Total Events</span>
                    <span className="text-lg font-bold text-futura-teal">{stats.totalEvents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Total Promoters</span>
                    <span className="text-lg font-bold text-blue-400">{stats.totalPromoters}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Active Now</span>
                    <span className="text-lg font-bold text-purple-400">{stats.pendingOrders}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
