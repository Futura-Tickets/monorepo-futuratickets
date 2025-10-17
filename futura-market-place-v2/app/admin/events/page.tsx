'use client';
import { useState, useEffect } from 'react';
import { getAdminEvents, updateEvent, deleteEvent } from '@/app/shared/services/services';
import { EventAPI } from '@/app/shared/interface';
import Link from 'next/link';
import { CreateEventModal } from '@/components/admin/CreateEventModal';
import { EditEventModal } from '@/components/admin/EditEventModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminEvents() {
  const [events, setEvents] = useState<EventAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventAPI | null>(null);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [promoterFilter, setPromoterFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getAdminEvents();
      setEvents(data);
      setError('');
    } catch (error: any) {
      console.error('Error loading events:', error);
      const errorMsg = error.message || 'Error loading events';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = () => {
    toast.success('Event created successfully!');
    loadEvents(); // Reload events after creating a new one
  };

  const handleEdit = (event: EventAPI) => {
    setSelectedEvent(event);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    loadEvents();
  };

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    // Search filter
    if (searchTerm && !event.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.location?.venue?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && event.status !== statusFilter) {
      return false;
    }

    // Promoter filter
    if (promoterFilter !== 'all') {
      const eventPromoterId = typeof event.promoter === 'object' ? event.promoter._id : event.promoter;
      if (eventPromoterId !== promoterFilter) {
        return false;
      }
    }

    // Date filter
    if (dateFilter !== 'all' && event.dateTime?.startDate) {
      const eventDate = new Date(event.dateTime.startDate);
      const now = new Date();

      if (dateFilter === 'upcoming') {
        if (eventDate < now) return false;
      } else if (dateFilter === 'past') {
        if (eventDate >= now) return false;
      } else if (dateFilter === 'this-month') {
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        if (eventDate.getMonth() !== thisMonth || eventDate.getFullYear() !== thisYear) {
          return false;
        }
      }
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, promoterFilter, dateFilter]);

  // Get unique promoters for filter dropdown
  const uniquePromoters = Array.from(
    new Map(
      events
        .map(event => {
          if (typeof event.promoter === 'object' && event.promoter) {
            return [event.promoter._id, event.promoter];
          }
          return null;
        })
        .filter(Boolean) as [string, any][]
    ).values()
  );

  const handleDelete = async (event: EventAPI) => {
    // Show confirmation toast
    toast.promise(
      new Promise<void>((resolve, reject) => {
        const confirmed = confirm(`Are you sure you want to delete "${event.name}"?`);
        if (!confirmed) {
          reject(new Error('Cancelled'));
          return;
        }

        deleteEvent(event._id)
          .then(() => {
            setError('');
            loadEvents();
            resolve();
          })
          .catch((error) => {
            console.error('Error deleting event:', error);
            const errorMsg = error.message || 'Error deleting event';
            setError(errorMsg);
            reject(error);
          });
      }),
      {
        loading: 'Deleting event...',
        success: 'Event deleted successfully!',
        error: (err) => err.message === 'Cancelled' ? 'Deletion cancelled' : 'Failed to delete event',
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin" className="text-futura-teal hover:text-futura-teal/80 mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-futura-teal">All Events</h1>
            <p className="text-gray-400 mt-2">
              Showing {filteredEvents.length} of {events.length} {events.length === 1 ? 'event' : 'events'}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-futura-teal px-6 py-2 rounded-md hover:bg-futura-teal/90 font-semibold transition-colors"
          >
            Create Event
          </button>
        </div>

        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="HOLD">Hold</SelectItem>
                <SelectItem value="CREATED">Created</SelectItem>
                <SelectItem value="LAUNCHED">Launched</SelectItem>
                <SelectItem value="LIVE">Live</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            {/* Promoter Filter */}
            <Select value={promoterFilter} onValueChange={setPromoterFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Promoters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Promoters</SelectItem>
                {uniquePromoters.map((promoter: any) => (
                  <SelectItem key={promoter._id} value={promoter._id}>
                    {promoter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Indicator */}
          {(searchTerm || statusFilter !== 'all' || promoterFilter !== 'all' || dateFilter !== 'all') && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Active filters:</span>
              {searchTerm && (
                <span className="bg-futura-teal/20 text-futura-teal px-2 py-1 rounded">
                  Search: "{searchTerm}"
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="bg-futura-teal/20 text-futura-teal px-2 py-1 rounded">
                  Status: {statusFilter}
                </span>
              )}
              {promoterFilter !== 'all' && (
                <span className="bg-futura-teal/20 text-futura-teal px-2 py-1 rounded">
                  Promoter: {uniquePromoters.find((p: any) => p._id === promoterFilter)?.name}
                </span>
              )}
              {dateFilter !== 'all' && (
                <span className="bg-futura-teal/20 text-futura-teal px-2 py-1 rounded">
                  Date: {dateFilter}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPromoterFilter('all');
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
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-gray-400 text-lg mb-4">No events found</p>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-futura-teal px-6 py-2 rounded-md hover:bg-futura-teal/90 font-semibold"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left p-4">Image</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Venue</th>
                    <th className="text-left p-4">City</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Capacity</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEvents.map((event) => (
                    <tr key={event._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        {event.image && (
                          <img
                            src={`${process.env.NEXT_PUBLIC_BLOB_URL}/${event.image}`}
                            alt={event.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="p-4 font-medium">{event.name}</td>
                      <td className="p-4 text-gray-400">{event.location?.venue || '-'}</td>
                      <td className="p-4 text-gray-400">{event.location?.city || '-'}</td>
                      <td className="p-4 text-gray-400">
                        {event.dateTime?.startDate
                          ? new Date(event.dateTime.startDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '-'
                        }
                      </td>
                      <td className="p-4 text-gray-400">{event.capacity || 0}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            event.status === 'LIVE'
                              ? 'bg-green-500/20 text-green-400'
                              : event.status === 'LAUNCHED'
                              ? 'bg-blue-500/20 text-blue-400'
                              : event.status === 'CREATED'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : event.status === 'CLOSED'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="text-futura-teal hover:text-futura-teal/80 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} results
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

      <CreateEventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleEventCreated}
      />

      <EditEventModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={handleEditSuccess}
        event={selectedEvent}
      />
    </div>
  );
}
