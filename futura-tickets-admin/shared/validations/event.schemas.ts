/**
 * Event Validation Schemas
 * Zod schemas for event forms
 */

import { z } from 'zod';

export const eventBasicInfoSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z
    .string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),
  genres: z
    .array(z.string())
    .min(1, 'Selecciona al menos un género'),
  capacity: z
    .number()
    .min(1, 'La capacidad debe ser al menos 1')
    .max(1000000, 'Capacidad máxima excedida'),
  maxQuantity: z
    .number()
    .min(1, 'La cantidad máxima debe ser al menos 1')
    .max(100, 'Cantidad máxima por compra excedida'),
});

export const eventLocationSchema = z.object({
  venue: z
    .string()
    .min(2, 'El nombre del lugar debe tener al menos 2 caracteres'),
  address: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres'),
  city: z
    .string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres'),
  state: z
    .string()
    .min(2, 'El estado/provincia debe tener al menos 2 caracteres'),
  country: z
    .string()
    .min(2, 'El país debe tener al menos 2 caracteres'),
  zipCode: z
    .string()
    .optional(),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
});

export const eventDateTimeSchema = z.object({
  launchDate: z.date(),
  startDate: z.date(),
  endDate: z.date(),
  doors: z.string().optional(),
  timezone: z.string().default('America/Mexico_City'),
}).refine((data) => data.startDate > data.launchDate, {
  message: 'La fecha de inicio debe ser posterior a la fecha de lanzamiento',
  path: ['startDate'],
}).refine((data) => data.endDate > data.startDate, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

export const ticketLotSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre del tipo de ticket debe tener al menos 2 caracteres'),
  price: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(1000000, 'Precio máximo excedido'),
  quantity: z
    .number()
    .min(1, 'La cantidad debe ser al menos 1'),
  description: z
    .string()
    .optional(),
  benefits: z
    .array(z.string())
    .optional(),
});

export const artistSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre del artista debe tener al menos 2 caracteres'),
  image: z.string().url('Debe ser una URL válida').optional(),
  bio: z.string().optional(),
  socialLinks: z.object({
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    spotify: z.string().url().optional(),
  }).optional(),
});

export const resaleConfigSchema = z.object({
  enabled: z.boolean(),
  maxPrice: z
    .number()
    .min(0, 'El precio máximo no puede ser negativo')
    .optional(),
  minPrice: z
    .number()
    .min(0, 'El precio mínimo no puede ser negativo')
    .optional(),
  commission: z
    .number()
    .min(0, 'La comisión no puede ser negativa')
    .max(100, 'La comisión no puede exceder 100%')
    .optional(),
}).refine(
  (data) => !data.maxPrice || !data.minPrice || data.maxPrice >= data.minPrice,
  {
    message: 'El precio máximo debe ser mayor o igual al precio mínimo',
    path: ['maxPrice'],
  }
);

export const createEventSchema = z.object({
  ...eventBasicInfoSchema.shape,
  location: eventLocationSchema,
  dateTime: eventDateTimeSchema,
  ticketLots: z.array(ticketLotSchema).min(1, 'Debe haber al menos un tipo de ticket'),
  artists: z.array(artistSchema).optional(),
  resale: resaleConfigSchema.optional(),
  commission: z.number().min(0).max(100).default(5),
  isBlockchain: z.boolean().default(true),
  image: z.string().min(1, 'La imagen del evento es requerida'),
  ticketImage: z.string().min(1, 'La imagen del ticket es requerida'),
});

// TypeScript types
export type EventBasicInfo = z.infer<typeof eventBasicInfoSchema>;
export type EventLocation = z.infer<typeof eventLocationSchema>;
export type EventDateTime = z.infer<typeof eventDateTimeSchema>;
export type TicketLot = z.infer<typeof ticketLotSchema>;
export type Artist = z.infer<typeof artistSchema>;
export type ResaleConfig = z.infer<typeof resaleConfigSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;
