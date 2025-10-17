/**
 * Payment Validation Schemas
 * Zod schemas for payment-related forms
 */

import { z } from 'zod';

export const paymentMethodSchema = z.object({
  type: z.enum(['bank_account', 'paypal', 'stripe', 'other']).refine((val) => ['bank_account', 'paypal', 'stripe', 'other'].includes(val), {
    message: 'Tipo de método de pago inválido',
  }),
  accountName: z
    .string()
    .min(2, 'El nombre de la cuenta debe tener al menos 2 caracteres'),
  accountNumber: z
    .string()
    .min(5, 'El número de cuenta debe tener al menos 5 caracteres')
    .max(50, 'El número de cuenta no puede exceder 50 caracteres'),
  bankName: z
    .string()
    .min(2, 'El nombre del banco debe tener al menos 2 caracteres')
    .optional(),
  routingNumber: z
    .string()
    .optional(),
  swiftCode: z
    .string()
    .optional(),
  country: z
    .string()
    .min(2, 'El país es requerido'),
  currency: z
    .string()
    .length(3, 'El código de moneda debe ser de 3 letras')
    .regex(/^[A-Z]+$/, 'El código de moneda debe estar en mayúsculas'),
  isDefault: z.boolean().default(false),
});

export const paymentRequestSchema = z.object({
  amount: z
    .number()
    .positive('El monto debe ser positivo')
    .max(1000000, 'Monto máximo excedido'),
  paymentMethodId: z
    .string()
    .min(1, 'Selecciona un método de pago'),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
});

export const bankAccountSchema = z.object({
  accountHolderName: z
    .string()
    .min(2, 'El nombre del titular debe tener al menos 2 caracteres'),
  bankName: z
    .string()
    .min(2, 'El nombre del banco debe tener al menos 2 caracteres'),
  accountNumber: z
    .string()
    .min(10, 'El número de cuenta debe tener al menos 10 dígitos')
    .max(20, 'El número de cuenta no puede exceder 20 dígitos')
    .regex(/^\d+$/, 'El número de cuenta solo debe contener dígitos'),
  routingNumber: z
    .string()
    .length(9, 'El routing number debe tener 9 dígitos')
    .regex(/^\d+$/, 'El routing number solo debe contener dígitos')
    .optional(),
  accountType: z.enum(['checking', 'savings']).refine((val) => ['checking', 'savings'].includes(val), {
    message: 'Tipo de cuenta inválido',
  }),
  country: z.string().min(2, 'El país es requerido'),
});

// TypeScript types
export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
export type PaymentRequestFormData = z.infer<typeof paymentRequestSchema>;
export type BankAccountFormData = z.infer<typeof bankAccountSchema>;
