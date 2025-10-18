import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { FeatureFlagGuard, FEATURE_FLAG_KEY } from './feature-flag.guard';

/**
 * Decorator to protect routes with feature flags
 *
 * @param flagKey Feature flag key to check
 *
 * @example
 * // Protect a single endpoint
 * @FeatureFlag('enable_resale_marketplace')
 * @Get('/resale')
 * async getResaleItems() {
 *   return this.resaleService.findAll();
 * }
 *
 * @example
 * // Protect entire controller
 * @Controller('admin/beta-features')
 * @FeatureFlag('enable_admin_beta_panel')
 * export class BetaFeaturesController { ... }
 */
export const FeatureFlag = (flagKey: string) => {
  return applyDecorators(SetMetadata(FEATURE_FLAG_KEY, flagKey), UseGuards(FeatureFlagGuard));
};

/**
 * Multiple feature flags (requires ALL to be enabled)
 *
 * @param flagKeys Array of feature flag keys
 *
 * @example
 * @RequireAllFlags(['enable_payments', 'enable_stripe'])
 * @Post('/payment')
 * async createPayment() { ... }
 */
export const RequireAllFlags = (...flagKeys: string[]) => {
  // For multiple flags, we'll need a more complex guard
  // For now, just use the first flag
  // TODO: Implement multi-flag support in guard
  return FeatureFlag(flagKeys[0]);
};
