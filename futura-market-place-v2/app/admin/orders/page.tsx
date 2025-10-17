'use client';
import { useState, useEffect } from 'react';
import { getAdminOrders, refundOrder } from '@/app/shared/services/services';
import { Order } from '@/app/shared/interface';
import Link from 'next/link';
import { toast } from 'sonner';
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'SUCCEEDED'>('all');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Additional filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders();
      setOrders(data);
      setError('');
    } catch (error: any) {
      console.error('Error loading orders:', error);
      const errorMsg = error.message || 'Error loading orders';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleRefund = async (order: Order) => {
    toast.promise(
      new Promise<void>((resolve, reject) => {
        const confirmed = confirm(
          `Are you sure you want to refund order ${order._id}?\n\n` +
          `This will refund €${calculateOrderTotal(order).toFixed(2)} to the customer.`
        );

        if (!confirmed) {
          reject(new Error('Cancelled'));
          return;
        }

        refundOrder(order._id)
          .then(() => {
            loadOrders(); // Reload orders to show updated status
            resolve();
          })
          .catch((error) => {
            console.error('Error processing refund:', error);
            reject(error);
          });
      }),
      {
        loading: 'Processing refund...',
        success: 'Refund processed successfully!',
        error: (err) => err.message === 'Cancelled' ? 'Refund cancelled' : 'Failed to process refund. Please check if the backend endpoint is implemented.',
      }
    );
  };

  // Enhanced filtering logic
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (filter !== 'all' && order.status !== filter) {
      return false;
    }

    // Search filter - by customer name, email, event name, or order ID
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const customerName = `${order.contactDetails?.name || ''} ${order.contactDetails?.lastName || ''}`.toLowerCase();
      const customerEmail = order.contactDetails?.email?.toLowerCase() || '';
      const eventName = typeof order.event === 'object' && order.event !== null
        ? order.event.name?.toLowerCase()
        : '';
      const orderId = order._id.toLowerCase();

      if (!customerName.includes(searchLower) &&
          !customerEmail.includes(searchLower) &&
          !eventName.includes(searchLower) &&
          !orderId.includes(searchLower)) {
        return false;
      }
    }

    // Date filter
    if (dateFilter !== 'all' && order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const now = new Date();

      if (dateFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (orderDate < today) return false;
      } else if (dateFilter === 'this-week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (orderDate < weekAgo) return false;
      } else if (dateFilter === 'this-month') {
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        if (orderDate.getMonth() !== thisMonth || orderDate.getFullYear() !== thisYear) {
          return false;
        }
      }
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter, dateFilter]);

  const calculateOrderTotal = (order: Order) => {
    const itemsTotal = order.items?.reduce((sum, item) => sum + (item.price * item.amount), 0) || 0;
    const resaleItemsTotal = order.resaleItems?.reduce((sum, item) => sum + (item.price * item.amount), 0) || 0;
    return itemsTotal + resaleItemsTotal;
  };

  // Update stats to use filtered orders for better context
  const totalRevenue = filteredOrders
    .filter(order => order.status === 'SUCCEEDED')
    .reduce((sum, order) => sum + calculateOrderTotal(order), 0);

  const successfulOrders = filteredOrders.filter(order => order.status === 'SUCCEEDED').length;
  const pendingOrders = filteredOrders.filter(order => order.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-futura-teal hover:text-futura-teal/80 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-futura-teal">Orders Management</h1>
          <p className="text-gray-400 mt-2">
            Showing {filteredOrders.length} of {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-futura-teal">
              €{totalRevenue.toFixed(2)}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Successful Orders</div>
            <div className="text-3xl font-bold text-green-400">
              {successfulOrders}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Pending Orders</div>
            <div className="text-3xl font-bold text-yellow-400">
              {pendingOrders}
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          {/* Search and Date Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search by customer, email, event, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-futura-teal text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter('SUCCEEDED')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'SUCCEEDED'
                  ? 'bg-futura-teal text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Successful
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'PENDING'
                  ? 'bg-futura-teal text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Pending
            </button>
          </div>

          {/* Active Filters Indicator */}
          {(searchTerm || dateFilter !== 'all' || filter !== 'all') && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Active filters:</span>
              {searchTerm && (
                <span className="bg-futura-teal/20 text-futura-teal px-2 py-1 rounded">
                  Search: "{searchTerm}"
                </span>
              )}
              {filter !== 'all' && (
                <span className="bg-futura-teal/20 text-futura-teal px-2 py-1 rounded">
                  Status: {filter}
                </span>
              )}
              {dateFilter !== 'all' && (
                <span className="bg-futura-teal/20 text-futura-teal px-2 py-1 rounded">
                  Date: {dateFilter.replace('-', ' ')}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setDateFilter('all');
                }}
                className="text-xs text-gray-400 hover:text-white underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-futura-teal"></div>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-gray-400 text-lg">No {filter !== 'all' ? filter.toLowerCase() : ''} orders found</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left p-4">Order ID</th>
                    <th className="text-left p-4">Customer</th>
                    <th className="text-left p-4">Event</th>
                    <th className="text-left p-4">Items</th>
                    <th className="text-left p-4">Total</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-sm text-gray-400">
                        {order._id.slice(-8)}
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">
                            {order.contactDetails?.name} {order.contactDetails?.lastName}
                          </div>
                          <div className="text-sm text-gray-400">
                            {order.contactDetails?.email}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {typeof order.event === 'object' && order.event !== null
                            ? order.event.name
                            : 'Event ID: ' + String(order.event).slice(-8)}
                        </div>
                      </td>
                      <td className="p-4 text-gray-400">
                        {(order.items?.length || 0) + (order.resaleItems?.length || 0)} tickets
                      </td>
                      <td className="p-4 font-semibold text-futura-teal">
                        €{calculateOrderTotal(order).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'SUCCEEDED'
                              ? 'bg-green-500/20 text-green-400'
                              : order.status === 'PENDING'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'
                        }
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="text-futura-teal hover:text-futura-teal/80 transition-colors"
                          >
                            View Details
                          </button>
                          {order.status === 'SUCCEEDED' && (
                            <button
                              onClick={() => handleRefund(order)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded transition-colors ${
                          currentPage === page
                            ? 'bg-futura-teal text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <OrderDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        order={selectedOrder}
      />
    </div>
  );
}
