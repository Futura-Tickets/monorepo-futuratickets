'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Mail,
  Archive,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  getAdminEvents,
  getAdminOrders,
  deleteEvent,
} from '@/app/shared/services/services';
import type { EventAPI, Order } from '@/app/shared/interface';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type OperationType = 'events' | 'orders';

export default function BulkOperations() {
  const [operationType, setOperationType] = useState<OperationType>('events');
  const [events, setEvents] = useState<EventAPI[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [operationType]);

  const loadData = async () => {
    try {
      setLoading(true);
      setSelectedIds(new Set());

      if (operationType === 'events') {
        const eventsData = await getAdminEvents();
        setEvents(eventsData);
      } else {
        const ordersData = await getAdminOrders();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (operationType === 'events') {
      if (selectedIds.size === events.length) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(events.map(e => e._id)));
      }
    } else {
      if (selectedIds.size === orders.length) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(orders.map(o => o._id)));
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      toast.error('No items selected');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedIds.size} ${operationType}? This action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    try {
      setProcessing(true);
      const deletePromises = Array.from(selectedIds).map(id =>
        operationType === 'events' ? deleteEvent(id) : Promise.resolve()
      );

      await Promise.all(deletePromises);
      toast.success(`Successfully deleted ${selectedIds.size} ${operationType}`);
      setSelectedIds(new Set());
      await loadData();
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Error deleting items');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkExport = () => {
    if (selectedIds.size === 0) {
      toast.error('No items selected');
      return;
    }

    const dataToExport = operationType === 'events'
      ? events.filter(e => selectedIds.has(e._id))
      : orders.filter(o => selectedIds.has(o._id));

    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${operationType}-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedIds.size} ${operationType}`);
  };

  const handleBulkUpdateStatus = async (newStatus: string) => {
    if (selectedIds.size === 0) {
      toast.error('No items selected');
      return;
    }

    try {
      setProcessing(true);
      // This would need to be implemented in the API
      toast.info('Bulk status update feature coming soon');
    } catch (error) {
      toast.error('Error updating status');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendBulkEmail = () => {
    if (selectedIds.size === 0) {
      toast.error('No items selected');
      return;
    }

    toast.info('Bulk email feature coming soon');
  };

  const renderEventsTable = () => (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/10">
          <tr>
            <th className="p-4 text-left">
              <Checkbox
                checked={selectedIds.size === events.length && events.length > 0}
                onCheckedChange={toggleSelectAll}
              />
            </th>
            <th className="p-4 text-left">Event Name</th>
            <th className="p-4 text-left">Date</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Tickets Sold</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event._id}
              className="border-t border-white/10 hover:bg-white/5 transition"
            >
              <td className="p-4">
                <Checkbox
                  checked={selectedIds.has(event._id)}
                  onCheckedChange={() => toggleSelection(event._id)}
                />
              </td>
              <td className="p-4">
                <div>
                  <p className="font-medium">{event.name}</p>
                  <p className="text-sm text-gray-400">{event.location?.venue}</p>
                </div>
              </td>
              <td className="p-4 text-gray-300">
                {new Date(event.dateTime.startDate).toLocaleDateString()}
              </td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    event.status === 'LIVE'
                      ? 'bg-green-500/20 text-green-400'
                      : event.status === 'LAUNCHED'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {event.status}
                </span>
              </td>
              <td className="p-4 text-gray-300">
                {event.capacity - event.availableTickets} / {event.capacity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOrdersTable = () => (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/10">
          <tr>
            <th className="p-4 text-left">
              <Checkbox
                checked={selectedIds.size === orders.length && orders.length > 0}
                onCheckedChange={toggleSelectAll}
              />
            </th>
            <th className="p-4 text-left">Order ID</th>
            <th className="p-4 text-left">Event</th>
            <th className="p-4 text-left">Date</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order._id}
              className="border-t border-white/10 hover:bg-white/5 transition"
            >
              <td className="p-4">
                <Checkbox
                  checked={selectedIds.has(order._id)}
                  onCheckedChange={() => toggleSelection(order._id)}
                />
              </td>
              <td className="p-4 font-mono text-sm">{order._id.slice(-8)}</td>
              <td className="p-4">
                <p className="font-medium">{order.event?.title || 'N/A'}</p>
              </td>
              <td className="p-4 text-gray-300">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
              </td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    order.status === 'SUCCEEDED'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="p-4 font-medium">€{order.total?.toFixed(2) || '0.00'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-futura-teal mx-auto mb-4"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
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
          <h1 className="text-4xl font-bold text-futura-teal">Bulk Operations</h1>
          <p className="text-gray-400 mt-2">Perform actions on multiple items at once</p>
        </div>

        {/* Selection Info */}
        {selectedIds.size > 0 && (
          <div className="mb-6 p-4 bg-futura-teal/20 border border-futura-teal/40 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-futura-teal" />
                <span className="font-medium">
                  {selectedIds.size} {operationType} selected
                </span>
              </div>
              <Button
                onClick={() => setSelectedIds(new Set())}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            onClick={handleBulkExport}
            disabled={processing || selectedIds.size === 0}
            variant="outline"
            className="bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
          <Button
            onClick={handleSendBulkEmail}
            disabled={processing || selectedIds.size === 0}
            variant="outline"
            className="bg-purple-500/20 border-purple-500/40 text-purple-400 hover:bg-purple-500/30"
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button
            onClick={handleBulkDelete}
            disabled={processing || selectedIds.size === 0}
            variant="outline"
            className="bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={operationType} onValueChange={(val) => setOperationType(val as OperationType)}>
          <TabsList className="bg-white/5">
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-6">
            {events.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-gray-400">No events found</p>
              </div>
            ) : (
              renderEventsTable()
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-gray-400">No orders found</p>
              </div>
            ) : (
              renderOrdersTable()
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
