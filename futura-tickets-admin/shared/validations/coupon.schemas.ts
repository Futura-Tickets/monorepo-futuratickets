/**
 * Coupon Validation Schemas
 * Zod schemas for coupon and promo code forms
 */

import { z } from 'zod';

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(20, 'El código no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9_-]+$/, 'Solo letras mayúsculas, números, guiones y guiones bajos'),
  description: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(200, 'La descripción no puede exceder 200 caracteres'),
  discountType: z.enum(['percentage', 'fixed']).refine((val) => val === 'percentage' || val === 'fixed', {
    message: 'Tipo de descuento inválido',
  }),
  discountValue: z
    .number()
    .positive('El valor del descuento debe ser positivo'),
  maxUses: z
    .number()
    .int()
    .positive('El máximo de usos debe ser un número positivo')
    .optional(),
  maxUsesPerUser: z
    .number()
    .int()
    .positive('El máximo de usos por usuario debe ser un número positivo')
    .optional(),
  validFrom: z.date(),
  validUntil: z.date(),
  minPurchaseAmount: z
    .number()
    .min(0, 'El monto mínimo no puede ser negativo')
    .optional(),
  applicableTicketTypes: z
    .array(z.string())
    .optional(),
}).refine((data) => data.validUntil > data.validFrom, {
  message: 'La fecha de vencimiento debe ser posterior a la fecha de inicio',
  path: ['validUntil'],
}).refine(
  (data) =>
    data.discountType !== 'percentage' ||
    (data.discountValue > 0 && data.discountValue <= 100),
  {
    message: 'El porcentaje de descuento debe estar entre 1 y 100',
    path: ['discountValue'],
  }
);

export const promoCodeSchema = z.object({
  code: z
    .string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(20, 'El código no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9_-]+$/, 'Solo letras mayúsculas, números, guiones y guiones bajos'),
  description: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(200, 'La descripción no puede exceder 200 caracteres'),
  discountPercent: z
    .number()
    .min(1, 'El descuento debe ser al menos 1%')
    .max(100, 'El descuento no puede exceder 100%'),
  maxUses: z
    .number()
    .int()
    .positive('El máximo de usos debe ser un número positivo'),
  validFrom: z.date(),
  validUntil: z.date(),
}).refine((data) => data.validUntil > data.validFrom, {
  message: 'La fecha de vencimiento debe ser posterior a la fecha de inicio',
  path: ['validUntil'],
});

export const invitationSchema = z.object({
  guestName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  guestEmail: z
    .string()
    .email('Debe ser un email válido'),
  guestPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s-()]+$/.test(val),
      'Número de teléfono inválido'
    ),
  ticketType: z
    .string()
    .min(1, 'Selecciona un tipo de ticket'),
  quantity: z
    .number()
    .int()
    .min(1, 'La cantidad debe ser al menos 1')
    .max(10, 'Máximo 10 invitaciones por vez'),
  message: z
    .string()
    .max(500, 'El mensaje no puede exceder 500 caracteres')
    .optional(),
});

// TypeScript types
export type CouponFormData = z.infer<typeof couponSchema>;
export type PromoCodeFormData = z.infer<typeof promoCodeSchema>;
export type InvitationFormData = z.infer<typeof invitationSchema>;
