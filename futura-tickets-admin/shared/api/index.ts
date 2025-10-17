/**
 * API Services Index
 * Central export point for all API services
 */

export { apiClient } from './client';
export { authService } from './auth.service';
export { eventsService } from './events.service';
export { salesService } from './sales.service';
export { ordersService } from './orders.service';
export { clientsService } from './clients.service';
export { paymentsService } from './payments.service';
export { notificationsService } from './notifications.service';
export { couponsService } from './coupons.service';
export { promoCodesService } from './promocodes.service';
export { invitationsService } from './invitations.service';
export { accountsService } from './accounts.service';
export { settingsService } from './settings.service';

// Re-export for backwards compatibility (deprecated - use named services instead)
export * from './auth.service';
export * from './events.service';
export * from './sales.service';
export * from './orders.service';
export * from './clients.service';
export * from './payments.service';
export * from './notifications.service';
export * from './coupons.service';
export * from './promocodes.service';
export * from './invitations.service';
export * from './accounts.service';
export * from './settings.service';
