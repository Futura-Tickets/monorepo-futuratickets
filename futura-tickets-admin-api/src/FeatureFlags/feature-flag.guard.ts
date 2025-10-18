import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureFlagsService } from './feature-flags.service';

export const FEATURE_FLAG_KEY = 'featureFlag';

/**
 * Guard to check if a feature flag is enabled
 *
 * Usage:
 * @FeatureFlag('enable_resale_marketplace')
 * @Get('/resale')
 * async getResaleItems() { ... }
 */
@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureFlagsService: FeatureFlagsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get feature flag key from decorator
    const flagKey = this.reflector.get<string>(FEATURE_FLAG_KEY, context.getHandler());

    if (!flagKey) {
      // No feature flag specified, allow access
      return true;
    }

    // Get request context
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assumes auth middleware populates this

    // Build context for feature flag evaluation
    const flagContext = {
      userId: user?._id?.toString() || user?.id?.toString(),
      userEmail: user?.email,
      userRole: user?.role,
      environment: process.env.NODE_ENV as any,
    };

    // Check if feature is enabled
    const isEnabled = await this.featureFlagsService.isEnabled(flagKey, flagContext);

    if (!isEnabled) {
      throw new ForbiddenException(
        `Feature '${flagKey}' is not available. Please contact support if you believe this is an error.`,
      );
    }

    return true;
  }
}
