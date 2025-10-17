'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Coupon, CouponType, CreateCoupon } from '@/app/shared/interface';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateCouponModal } from '@/components/admin/CreateCouponModal';
import { EditCouponModal } from '@/components/admin/EditCouponModal';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a la API
      // const data = await getCoupons();
      // setCoupons(data);

      // Mock data por ahora
      const mockCoupons: Coupon[] = [
        {
          _id: '1',
          code: 'SUMMER2024',
          type: CouponType.PERCENTAGE,
          discount: 20,
          maxUses: 100,
          usedCount: 45,
          maxUsesPerUser: 1,
          startDate: new Date('2024-06-01'),
          expirationDate: new Date('2024-08-31'),
          isActive: true,
          description: 'Summer discount 20%'
        },
        {
          _id: '2',
          code: 'WELCOME10',
          type: CouponType.FIXED_AMOUNT,
          discount: 10,
          maxUses: 500,
          usedCount: 230,
          maxUsesPerUser: 1,
          startDate: new Date('2024-01-01'),
          expirationDate: new Date('2024-12-31'),
          isActive: true,
          description: 'Welcome bonus €10 off'
        }
      ];

      setCoupons(mockCoupons);
      setError('');
    } catch (error: any) {
      console.error('Error loading coupons:', error);
      const errorMsg = error.message || 'Error loading coupons';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    toast.promise(
      new Promise<void>((resolve, reject) => {
        const confirmed = confirm(`Are you sure you want to delete coupon "${coupon.code}"?`);
        if (!confirmed) {
          reject(new Error('Cancelled'));
          return;
        }

        // TODO: Implementar eliminación
        setTimeout(() => {
          setCoupons(coupons.filter(c => c._id !== coupon._id));
          resolve();
        }, 500);
      }),
      {
        loading: 'Deleting coupon...',
        success: 'Coupon deleted successfully!',
        error: (err) => err.message === 'Cancelled' ? 'Deletion cancelled' : 'Failed to delete coupon',
      }
    );
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      // TODO: Implementar activación/desactivación
      const updated = coupons.map(c =>
        c._id === coupon._id ? { ...c, isActive: !c.isActive } : c
      );
      setCoupons(updated);
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error('Failed to update coupon status');
    }
  };

  const handleCreateCoupon = async (newCoupon: CreateCoupon) => {
    // TODO: Implementar creación con API
    const coupon: Coupon = {
      _id: Date.now().toString(),
      ...newCoupon,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCoupons([coupon, ...coupons]);
  };

  const handleEditCoupon = async (id: string, updates: Partial<Coupon>) => {
    // TODO: Implementar edición con API
    const updated = coupons.map(c =>
      c._id === id ? { ...c, ...updates, updatedAt: new Date() } : c
    );
    setCoupons(updated);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsEditModalOpen(true);
  };

  // Filter coupons
  const filteredCoupons = coupons.filter(coupon => {
    // Search filter
    if (searchTerm && !coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Type filter
    if (typeFilter !== 'all' && coupon.type !== typeFilter) {
      return false;
    }

    // Status filter
    if (statusFilter === 'active' && !coupon.isActive) return false;
    if (statusFilter === 'inactive' && coupon.isActive) return false;
    if (statusFilter === 'expired') {
      const now = new Date();
      if (new Date(coupon.expirationDate) >= now) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCoupons = filteredCoupons.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

  const getTypeColor = (type: CouponType) => {
    switch (type) {
      case CouponType.PERCENTAGE:
        return 'bg-blue-500/20 text-blue-400';
      case CouponType.FIXED_AMOUNT:
        return 'bg-green-500/20 text-green-400';
      case CouponType.TWO_FOR_ONE:
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeLabel = (type: CouponType) => {
    switch (type) {
      case CouponType.PERCENTAGE:
        return 'Percentage';
      case CouponType.FIXED_AMOUNT:
        return 'Fixed Amount';
      case CouponType.TWO_FOR_ONE:
        return '2x1';
      default:
        return type;
    }
  };

  const isExpired = (date: Date) => new Date(date) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin" className="text-futura-teal hover:text-futura-teal/80 mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-futura-teal">Coupons Management</h1>
            <p className="text-gray-400 mt-2">
              Showing {filteredCoupons.length} of {coupons.length} {coupons.length === 1 ? 'coupon' : 'coupons'}
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-futura-teal px-6 py-2 rounded-md hover:bg-futura-teal/90 font-semibold transition-colors"
          >
            Create Coupon
          </button>
        </div>

        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={CouponType.PERCENTAGE}>Percentage</SelectItem>
                <SelectItem value={CouponType.FIXED_AMOUNT}>Fixed Amount</SelectItem>
                <SelectItem value={CouponType.TWO_FOR_ONE}>2x1</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Active filters:</span>
              {searchTerm && (
                <span className="bg-futura-teal/20 text-futura-teal px-2 py-1 rounded">
                  Search: "{searchTerm}"
                </span>
              )}
              {typeFilter !== 'all' && (
                <span className="bg-futura-teal/20 text-futura-teal px-2 py-1 rounded">
                  Type: {getTypeLabel(typeFilter as CouponType)}
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="bg-futura-teal/20 text-futura-teal px-2 py-1 rounded">
                  Status: {statusFilter}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setStatusFilter('all');
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
        ) : paginatedCoupons.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-gray-400 text-lg mb-4">No coupons found</p>
            <button className="bg-futura-teal px-6 py-2 rounded-md hover:bg-futura-teal/90 font-semibold">
              Create Your First Coupon
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left p-4">Code</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Discount</th>
                    <th className="text-left p-4">Usage</th>
                    <th className="text-left p-4">Valid Period</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCoupons.map((coupon) => {
                    const expired = isExpired(coupon.expirationDate);
                    const usagePercent = (coupon.usedCount / coupon.maxUses) * 100;

                    return (
                      <tr key={coupon._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div>
                            <div className="font-bold text-futura-teal">{coupon.code}</div>
                            {coupon.description && (
                              <div className="text-xs text-gray-400 mt-1">{coupon.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(coupon.type)}`}>
                            {getTypeLabel(coupon.type)}
                          </span>
                        </td>
                        <td className="p-4 font-semibold">
                          {coupon.type === CouponType.PERCENTAGE ? `${coupon.discount}%` :
                           coupon.type === CouponType.FIXED_AMOUNT ? `€${coupon.discount}` : '2x1'}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm">
                              {coupon.usedCount} / {coupon.maxUses}
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  usagePercent >= 90 ? 'bg-red-500' :
                                  usagePercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="text-gray-400">
                            {new Date(coupon.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' - '}
                            {new Date(coupon.expirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {expired ? (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                Expired
                              </span>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                coupon.isActive
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {coupon.isActive ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {!expired && (
                              <button
                                onClick={() => handleToggleActive(coupon)}
                                className={`text-sm ${
                                  coupon.isActive
                                    ? 'text-yellow-400 hover:text-yellow-300'
                                    : 'text-green-400 hover:text-green-300'
                                } transition-colors`}
                              >
                                {coupon.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEdit(coupon)}
                              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(coupon)}
                              className="text-red-400 hover:text-red-300 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredCoupons.length)} of {filteredCoupons.length} results
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

        {/* Modals */}
        <CreateCouponModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateCoupon}
        />

        <EditCouponModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          coupon={selectedCoupon}
          onSave={handleEditCoupon}
        />
      </div>
    </div>
  );
}
