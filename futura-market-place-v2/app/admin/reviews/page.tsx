'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { getAdminReviews, updateReviewStatus, deleteReview } from '@/app/shared/services/services';
import type { Review, ReviewStatus } from '@/app/shared/interface';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, reviews]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getAdminReviews();
      setReviews(data);
      setFilteredReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await updateReviewStatus(reviewId, 'APPROVED');
      toast.success('Review approved');
      loadReviews();
    } catch (error) {
      toast.error('Error approving review');
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await updateReviewStatus(reviewId, 'REJECTED');
      toast.success('Review rejected');
      loadReviews();
    } catch (error) {
      toast.error('Error rejecting review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteReview(reviewId);
      toast.success('Review deleted');
      loadReviews();
    } catch (error) {
      toast.error('Error deleting review');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: ReviewStatus) => {
    const styles = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      APPROVED: 'bg-green-500/20 text-green-400',
      REJECTED: 'bg-red-500/20 text-red-400',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-futura-dark to-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-futura-teal mx-auto mb-4"></div>
              <p className="text-gray-400">Loading reviews...</p>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-futura-teal">Reviews Management</h1>
              <p className="text-gray-400 mt-2">Manage and moderate user reviews</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-300">Filter by status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Reviews</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold">
                  {reviews.filter(r => r.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Approved</p>
                <p className="text-2xl font-bold">
                  {reviews.filter(r => r.status === 'APPROVED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold">
                  {reviews.filter(r => r.status === 'REJECTED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-gray-400">No reviews found</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review._id}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{review.userName}</h3>
                      {getStatusBadge(review.status)}
                      {review.isVerifiedPurchase && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Event: {review.eventName}</p>
                    <div className="flex items-center gap-3 mb-3">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300">{review.comment}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {review.status === 'PENDING' && (
                    <>
                      <Button
                        onClick={() => handleApprove(review._id)}
                        variant="outline"
                        size="sm"
                        className="bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(review._id)}
                        variant="outline"
                        size="sm"
                        className="bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleDelete(review._id)}
                    variant="outline"
                    size="sm"
                    className="bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
