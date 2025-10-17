'use client';
import { useState, useEffect } from 'react';
import { getAdminPromoters, updatePromoter, deletePromoter, getPromoterEvents } from '@/app/shared/services/services';
import Link from 'next/link';
import { CreatePromoterModal } from '@/components/admin/CreatePromoterModal';
import { EditPromoterModal } from '@/components/admin/EditPromoterModal';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Promoter {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  createdAt?: string;
}

export default function AdminPromoters() {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPromoter, setSelectedPromoter] = useState<Promoter | null>(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPromoters();
  }, []);

  const loadPromoters = async () => {
    try {
      setLoading(true);
      const data = await getAdminPromoters();
      setPromoters(data);
      setError('');
    } catch (error: any) {
      console.error('Error loading promoters:', error);
      const errorMsg = error.message || 'Error loading promoters';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoterCreated = () => {
    toast.success('Promoter created successfully!');
    loadPromoters(); // Reload promoters after creating a new one
  };

  const handleViewEvents = async (promoter: Promoter) => {
    const loadingToast = toast.loading(`Loading events for ${promoter.name}...`);

    try {
      const events = await getPromoterEvents(promoter._id);
      toast.dismiss(loadingToast);

      if (events.length === 0) {
        toast.info(`No events found for ${promoter.name}`);
      } else {
        const eventNames = events.map(e => e.name).join('\n');
        toast.success(`Events for ${promoter.name}:\n\n${eventNames}`, {
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Error loading promoter events:', error);
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Error loading events');
    }
  };

  const handleEdit = (promoter: Promoter) => {
    setSelectedPromoter(promoter);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    loadPromoters();
  };

  const handleDelete = async (promoter: Promoter) => {
    toast.promise(
      new Promise<void>((resolve, reject) => {
        const confirmed = confirm(`Are you sure you want to delete "${promoter.name}"?`);
        if (!confirmed) {
          reject(new Error('Cancelled'));
          return;
        }

        deletePromoter(promoter._id)
          .then(() => {
            setError('');
            loadPromoters();
            resolve();
          })
          .catch((error) => {
            console.error('Error deleting promoter:', error);
            const errorMsg = error.message || 'Error deleting promoter';
            setError(errorMsg);
            reject(error);
          });
      }),
      {
        loading: 'Deleting promoter...',
        success: 'Promoter deleted successfully!',
        error: (err) => err.message === 'Cancelled' ? 'Deletion cancelled' : 'Failed to delete promoter',
      }
    );
  };

  // Filter promoters based on search
  const filteredPromoters = promoters.filter(promoter => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      promoter.name?.toLowerCase().includes(searchLower) ||
      promoter.email?.toLowerCase().includes(searchLower) ||
      promoter.phone?.toLowerCase().includes(searchLower) ||
      promoter.website?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPromoters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPromoters = filteredPromoters.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin" className="text-futura-teal hover:text-futura-teal/80 mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-futura-teal">Promoters Management</h1>
            <p className="text-gray-400 mt-2">
              Showing {filteredPromoters.length} of {promoters.length} {promoters.length === 1 ? 'promoter' : 'promoters'}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-futura-teal px-6 py-2 rounded-md hover:bg-futura-teal/90 font-semibold transition-colors"
          >
            Create Promoter
          </button>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <Input
            placeholder="Search promoters by name, email, phone, or website..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 max-w-md"
          />
          {searchTerm && (
            <div className="flex items-center gap-2 text-sm mt-2">
              <span className="text-gray-400">Active filter:</span>
              <span className="bg-futura-teal/20 text-futura-teal px-2 py-1 rounded">
                Search: "{searchTerm}"
              </span>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-gray-400 hover:text-white underline"
              >
                Clear
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
        ) : filteredPromoters.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-gray-400 text-lg mb-4">No promoters found</p>
            <button className="bg-futura-teal px-6 py-2 rounded-md hover:bg-futura-teal/90 font-semibold">
              Create Your First Promoter
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Phone</th>
                    <th className="text-left p-4">Website</th>
                    <th className="text-left p-4">Created At</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPromoters.map((promoter) => (
                    <tr key={promoter._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium">{promoter.name}</td>
                      <td className="p-4 text-gray-400">{promoter.email || '-'}</td>
                      <td className="p-4 text-gray-400">{promoter.phone || '-'}</td>
                      <td className="p-4 text-gray-400">
                        {promoter.website ? (
                          <a
                            href={promoter.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-futura-teal hover:text-futura-teal/80"
                          >
                            Visit
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-4 text-gray-400">
                        {promoter.createdAt
                          ? new Date(promoter.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '-'
                        }
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewEvents(promoter)}
                            className="text-futura-teal hover:text-futura-teal/80 transition-colors"
                          >
                            View Events
                          </button>
                          <button
                            onClick={() => handleEdit(promoter)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(promoter)}
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredPromoters.length)} of {filteredPromoters.length} results
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

      <CreatePromoterModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handlePromoterCreated}
      />

      <EditPromoterModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={handleEditSuccess}
        promoter={selectedPromoter}
      />
    </div>
  );
}
