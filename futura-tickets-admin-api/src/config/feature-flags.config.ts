/**
 * Feature Flags Configuration
 *
 * Sistema de feature flags para migración gradual de arquitectura hexagonal
 *
 * Uso:
 * - Durante migración: Permite activar/desactivar nueva arquitectura
 * - En producción: Rollout gradual por % de usuarios
 * - Rollback: Desactivar rápidamente en caso de problemas
 */

export interface FeatureFlags {
  // Sales Module
  USE_HEXAGONAL_SALES: boolean;
  HEXAGONAL_SALES_PERCENTAGE: number; // 0-100

  // Orders Module (futuro)
  USE_HEXAGONAL_ORDERS: boolean;
  HEXAGONAL_ORDERS_PERCENTAGE: number;

  // Payments Module (futuro)
  USE_HEXAGONAL_PAYMENTS: boolean;
  HEXAGONAL_PAYMENTS_PERCENTAGE: number;

  // Events Module (futuro)
  USE_HEXAGONAL_EVENTS: boolean;
  HEXAGONAL_EVENTS_PERCENTAGE: number;

  // Global
  ENABLE_MIGRATION_LOGGING: boolean; // Log cuando se usa legacy vs hexagonal
  ENABLE_COMPARISON_MODE: boolean; // Ejecutar ambos y comparar resultados
}

export const featureFlagsConfig = (): FeatureFlags => ({
  // Sales Module
  USE_HEXAGONAL_SALES: process.env.USE_HEXAGONAL_SALES === 'true',
  HEXAGONAL_SALES_PERCENTAGE: parseInt(process.env.HEXAGONAL_SALES_PERCENTAGE || '0', 10),

  // Orders Module
  USE_HEXAGONAL_ORDERS: process.env.USE_HEXAGONAL_ORDERS === 'true',
  HEXAGONAL_ORDERS_PERCENTAGE: parseInt(process.env.HEXAGONAL_ORDERS_PERCENTAGE || '0', 10),

  // Payments Module
  USE_HEXAGONAL_PAYMENTS: process.env.USE_HEXAGONAL_PAYMENTS === 'true',
  HEXAGONAL_PAYMENTS_PERCENTAGE: parseInt(process.env.HEXAGONAL_PAYMENTS_PERCENTAGE || '0', 10),

  // Events Module
  USE_HEXAGONAL_EVENTS: process.env.USE_HEXAGONAL_EVENTS === 'true',
  HEXAGONAL_EVENTS_PERCENTAGE: parseInt(process.env.HEXAGONAL_EVENTS_PERCENTAGE || '0', 10),

  // Global
  ENABLE_MIGRATION_LOGGING: process.env.ENABLE_MIGRATION_LOGGING === 'true' || false,
  ENABLE_COMPARISON_MODE: process.env.ENABLE_COMPARISON_MODE === 'true' || false,
});

/**
 * Helper para determinar si un request debe usar hexagonal
 * basado en un hash del user ID (distribución uniforme)
 */
export function shouldUseHexagonal(userId: string, percentage: number): boolean {
  if (percentage === 0) return false;
  if (percentage === 100) return true;

  // Hash simple del userId para distribución uniforme
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  const bucket = hash % 100;
  return bucket < percentage;
}
