/**
 * Futura Tickets Admin - Services Index
 *
 * This file exports all service functions organized by domain.
 * Import from this file instead of individual service files.
 *
 * Example usage:
 *   import { loginAccount, getEvents, getSales } from '@/shared/services';
 */

// Authentication Services
export {
  createAccount,
  createPromoterAccount,
  createAccessAccount,
  loginAccount,
  loginGoogle,
  checkExpiration,
  getProfile,
  updateAccount,
  getAdminAccounts,
  deleteAdminAccount,
} from './auth.service';

// Events Services
export {
  getEvents,
  getEvent,
  createEvent,
  editEvent,
  launchEvent,
  deleteEvent,
  getEventResale,
  enableResale,
  exportEventCSVRequest,
} from './events.service';

// Sales Services
export {
  getSales,
  getSale,
} from './sales.service';

// Orders Services
export {
  getOrders,
  getOrder,
  resendEmailOrder,
} from './orders.service';

// Clients Services
export {
  getClients,
  getClient,
  exportClientsCSVRequest,
} from './clients.service';

// Payments Services
export {
  getPayments,
  getPaymentMethods,
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentRequests,
  createPaymentRequest,
  deletePaymentRequest,
} from './payments.service';

// Analytics Services
export {
  getAnalytics,
  getCampaigns,
} from './analytics.service';

// Promo Services (Coupons & Promo Codes)
export {
  createCoupon,
  getCoupons,
  deleteCoupon,
  getPromoCodes,
  createPromoCode,
  deletePromoCode,
} from './promo.service';

// Invitations Services
export {
  getInvitations,
  getEventInvitations,
  createInvitation,
  deleteInvitation,
} from './invitations.service';

// Access Services
export {
  getEventAccessAccounts,
  getEventAccess,
} from './access.service';

// Notifications Services
export {
  getNotifications,
  getNotificationsByOrderId,
  getNotificationsByClientId,
  getNotificationByOrderId,
  markAsRead,
  markAllAsRead,
} from './notifications.service';

// Settings Services
export {
  enableDisableApi,
  getFuturaApiSettings,
} from './settings.service';
