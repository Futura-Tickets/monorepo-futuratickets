'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Order } from '@/app/shared/interface';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderDetailsModal({ open, onOpenChange, order }: OrderDetailsModalProps) {
  if (!order) return null;

  const items = order.items || [];
  const resaleItems = order.resaleItems || [];
  const allItems = [...items, ...resaleItems];

  const calculateOrderTotal = (order: Order) => {
    const itemsTotal = order.items?.reduce((sum, item) => sum + (item.price * item.amount), 0) || 0;
    const resaleItemsTotal = order.resaleItems?.reduce((sum, item) => sum + (item.price * item.amount), 0) || 0;
    return itemsTotal + resaleItemsTotal;
  };

  const total = calculateOrderTotal(order);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-futura-dark text-white border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl text-futura-teal">Order Details</DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete information about this order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order ID and Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Order ID</p>
              <p className="font-mono text-lg">{order._id}</p>
            </div>
            <Badge className={`${getStatusColor(order.status)} border`}>
              {order.status}
            </Badge>
          </div>

          <Separator className="bg-white/10" />

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-futura-teal">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-lg border border-white/10">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="font-medium">
                  {order.contactDetails?.name} {order.contactDetails?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-medium break-all">{order.contactDetails?.email}</p>
              </div>
              {order.contactDetails?.phone && (
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="font-medium">{order.contactDetails.phone}</p>
                </div>
              )}
              {order.contactDetails?.birthdate && (
                <div>
                  <p className="text-sm text-gray-400">Birthdate</p>
                  <p className="font-medium">
                    {new Date(order.contactDetails.birthdate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Event Information */}
          {order.event && typeof order.event === 'object' && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-futura-teal">Event Information</h3>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="font-semibold text-lg mb-2">{order.event.name}</p>
                  {order.event.location && (
                    <div className="text-sm text-gray-400">
                      <p>{order.event.location.venue}</p>
                      <p>{order.event.location.city}, {order.event.location.country}</p>
                    </div>
                  )}
                  {order.event.dateTime?.startDate && (
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(order.event.dateTime.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-white/10" />
            </>
          )}

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-futura-teal">Items</h3>
            <div className="space-y-2">
              {allItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{item.type}</p>
                      <p className="text-sm text-gray-400">
                        Quantity: {item.amount}
                        {item.sale && (
                          <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                            Resale
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{(item.price * item.amount).toFixed(2)}</p>
                    <p className="text-sm text-gray-400">€{item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Pricing Summary */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-futura-teal">Payment Summary</h3>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              {order.commission && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Commission</span>
                  <span>€{order.commission.toFixed(2)}</span>
                </div>
              )}
              {order.couponCode && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Coupon ({order.couponCode})</span>
                  <span>-€0.00</span>
                </div>
              )}
              {order.promoCode && (
                <div className="flex justify-between text-sm text-blue-400">
                  <span>Promo Code ({order.promoCode})</span>
                  <span className="text-xs">(Applied)</span>
                </div>
              )}
              <Separator className="bg-white/10" />
              <div className="flex justify-between font-bold text-lg text-futura-teal">
                <span>Total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-futura-teal">Payment Information</h3>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-2 text-sm">
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment ID</span>
                  <span className="font-mono">{order.paymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Created At</span>
                <span>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </span>
              </div>
              {order.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated</span>
                  <span>
                    {new Date(order.updatedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sales/Tickets Information */}
          {order.sales && order.sales.length > 0 && (
            <>
              <Separator className="bg-white/10" />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-futura-teal">Tickets Generated</h3>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-400">
                    Total Tickets: <span className="text-white font-semibold">{order.sales.length}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Each ticket has a unique QR code for event access
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-futura-teal hover:bg-futura-teal/90 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
