import { z } from 'zod';

/**
 * Validation Schemas for Futura Marketplace API Routes
 * Uses Zod for runtime type validation and error handling
 */

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginCredentialsSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

export const registerCredentialsSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const recoverPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const updateUserProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  birthdate: z.string().datetime().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ['newPassword'],
});

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const orderItemSchema = z.object({
  sale: z.string().optional(),
  type: z.string().min(1, 'Ticket type is required'),
  amount: z.number().int().positive('Amount must be positive'),
  price: z.number().positive('Price must be positive'),
});

export const contactDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  birthdate: z.string().datetime().optional(),
});

export const createOrderSchema = z.object({
  contactDetails: contactDetailsSchema.optional(),
  orders: z.array(z.object({
    event: z.string().min(1, 'Event ID is required'),
    promoter: z.string().min(1, 'Promoter ID is required'),
    paymentId: z.string().optional(),
    promoCode: z.string().optional(),
    couponCode: z.string().optional(),
    items: z.array(orderItemSchema).min(1, 'At least one item is required'),
    resaleItems: z.array(orderItemSchema).default([]),
  })).min(1, 'At least one order is required'),
});

// ============================================================================
// RESALE SCHEMAS
// ============================================================================

export const createResaleSchema = z.object({
  saleId: z.string().min(1, 'Sale ID is required'),
  resalePrice: z.number().positive('Resale price must be positive'),
});

export const cancelResaleSchema = z.object({
  saleId: z.string().min(1, 'Sale ID is required'),
});

export const purchaseResaleSchema = z.object({
  resaleId: z.string().min(1, 'Resale ID is required'),
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
});

// ============================================================================
// TRANSFER SCHEMAS
// ============================================================================

export const transferTicketSchema = z.object({
  saleId: z.string().min(1, 'Sale ID is required'),
  transferTo: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
    birthdate: z.string().datetime().optional(),
  }),
});

// ============================================================================
// COUPON & PROMO CODE SCHEMAS
// ============================================================================

export const couponCodeSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters').max(20),
  eventId: z.string().optional(),
});

export const promoCodeSchema = z.object({
  code: z.string().min(3, 'Promo code must be at least 3 characters').max(20),
  eventId: z.string().optional(),
});

// ============================================================================
// HELPER TYPES (for TypeScript inference)
// ============================================================================

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type CreateResale = z.infer<typeof createResaleSchema>;
export type TransferTicket = z.infer<typeof transferTicketSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
