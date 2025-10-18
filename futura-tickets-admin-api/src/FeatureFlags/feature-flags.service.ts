import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FeatureFlag, FeatureFlagDocument } from './feature-flag.schema';

export interface FeatureFlagContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  environment?: 'development' | 'staging' | 'production';
}

export interface CreateFeatureFlagDto {
  key: string;
  name: string;
  description?: string;
  tags?: string[];
  createdBy: string;
}

export interface UpdateFeatureFlagDto {
  name?: string;
  description?: string;
  development?: any;
  staging?: any;
  production?: any;
  scheduledEnableDate?: Date;
  scheduledDisableDate?: Date;
  status?: 'development' | 'beta' | 'stable' | 'deprecated';
  tags?: string[];
  active?: boolean;
  lastModifiedBy: string;
}

@Injectable()
export class FeatureFlagsService {
  private readonly logger = new Logger(FeatureFlagsService.name);
  private cache: Map<string, { flag: FeatureFlag; cachedAt: Date }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  constructor(
    @InjectModel(FeatureFlag.name)
    private featureFlagModel: Model<FeatureFlagDocument>,
  ) {}

  /**
   * Check if a feature is enabled for given context
   *
   * @param key Feature flag key
   * @param context User/environment context
   * @returns true if feature is enabled, false otherwise
   */
  async isEnabled(key: string, context: FeatureFlagContext = {}): Promise<boolean> {
    try {
      const flag = await this.getFlag(key);

      if (!flag) {
        this.logger.warn(`Feature flag not found: ${key}`);
        return false; // Fail safe - unknown flags are disabled
      }

      // Check master switch
      if (!flag.active) {
        return false;
      }

      // Check scheduled dates
      const now = new Date();
      if (flag.scheduledEnableDate && now < flag.scheduledEnableDate) {
        return false; // Not yet enabled
      }
      if (flag.scheduledDisableDate && now > flag.scheduledDisableDate) {
        return false; // Already disabled
      }

      // Get environment config
      const environment = context.environment || this.getCurrentEnvironment();
      const envConfig = flag[environment];

      if (!envConfig || !envConfig.enabled) {
        return false;
      }

      // Check targeting rules
      if (envConfig.targeting && envConfig.targeting.length > 0) {
        return this.evaluateTargeting(envConfig.targeting, context);
      }

      // Update evaluation stats (async, non-blocking)
      this.updateEvaluationStats(key).catch((err) =>
        this.logger.error(`Failed to update stats for ${key}:`, err),
      );

      return true;
    } catch (error) {
      this.logger.error(`Error evaluating feature flag ${key}:`, error);
      return false; // Fail safe
    }
  }

  /**
   * Evaluate targeting rules
   */
  private evaluateTargeting(
    rules: any[],
    context: FeatureFlagContext,
  ): boolean {
    for (const rule of rules) {
      switch (rule.type) {
        case 'user':
          if (context.userId && rule.values.includes(context.userId)) {
            return true;
          }
          break;

        case 'email':
          if (context.userEmail && rule.values.includes(context.userEmail)) {
            return true;
          }
          break;

        case 'role':
          if (context.userRole && rule.values.includes(context.userRole)) {
            return true;
          }
          break;

        case 'percentage':
          if (context.userId && rule.percentage) {
            const hash = this.hashUserId(context.userId);
            const userPercentage = (hash % 100) + 1;
            if (userPercentage <= rule.percentage) {
              return true;
            }
          }
          break;
      }
    }

    return false;
  }

  /**
   * Simple hash function for percentage rollouts
   * Ensures consistent user assignment
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get feature flag with caching
   */
  private async getFlag(key: string): Promise<FeatureFlag | null> {
    // Check cache
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.cachedAt.getTime() < this.CACHE_TTL) {
      return cached.flag;
    }

    // Fetch from database
    const flag = await this.featureFlagModel.findOne({ key }).lean().exec();

    if (flag) {
      this.cache.set(key, { flag, cachedAt: new Date() });
    }

    return flag;
  }

  /**
   * Create new feature flag
   */
  async create(dto: CreateFeatureFlagDto): Promise<FeatureFlag> {
    const flag = new this.featureFlagModel(dto);
    await flag.save();

    this.logger.log(`Feature flag created: ${dto.key}`);
    this.invalidateCache(dto.key);

    return flag;
  }

  /**
   * Update feature flag
   */
  async update(
    key: string,
    dto: UpdateFeatureFlagDto,
  ): Promise<FeatureFlag> {
    const flag = await this.featureFlagModel.findOneAndUpdate(
      { key },
      { $set: dto },
      { new: true },
    );

    if (!flag) {
      throw new NotFoundException(`Feature flag not found: ${key}`);
    }

    this.logger.log(`Feature flag updated: ${key}`);
    this.invalidateCache(key);

    return flag;
  }

  /**
   * Delete feature flag
   */
  async delete(key: string): Promise<void> {
    const result = await this.featureFlagModel.deleteOne({ key });

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Feature flag not found: ${key}`);
    }

    this.logger.log(`Feature flag deleted: ${key}`);
    this.invalidateCache(key);
  }

  /**
   * Get all feature flags
   */
  async findAll(): Promise<FeatureFlag[]> {
    return this.featureFlagModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Get feature flag by key
   */
  async findByKey(key: string): Promise<FeatureFlag> {
    const flag = await this.featureFlagModel.findOne({ key }).exec();

    if (!flag) {
      throw new NotFoundException(`Feature flag not found: ${key}`);
    }

    return flag;
  }

  /**
   * Update evaluation statistics
   */
  private async updateEvaluationStats(key: string): Promise<void> {
    await this.featureFlagModel.updateOne(
      { key },
      {
        $inc: { evaluationCount: 1 },
        $set: { lastEvaluatedAt: new Date() },
      },
    );
  }

  /**
   * Invalidate cache for a feature flag
   */
  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.log('Feature flags cache cleared');
  }

  /**
   * Get current environment from NODE_ENV
   */
  private getCurrentEnvironment(): 'development' | 'staging' | 'production' {
    const env = process.env.NODE_ENV;

    if (env === 'production') return 'production';
    if (env === 'staging') return 'staging';
    return 'development';
  }

  /**
   * Cron job: Process scheduled feature flags
   * Runs every hour to check for scheduled enable/disable dates
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processScheduledFlags(): Promise<void> {
    this.logger.log('Processing scheduled feature flags...');

    const now = new Date();

    // Find flags that should be auto-enabled
    const flagsToEnable = await this.featureFlagModel.find({
      scheduledEnableDate: { $lte: now },
      active: false,
    });

    for (const flag of flagsToEnable) {
      const environment = this.getCurrentEnvironment();
      await this.featureFlagModel.updateOne(
        { _id: flag._id },
        {
          $set: {
            [`${environment}.enabled`]: true,
            scheduledEnableDate: null, // Remove schedule
          },
        },
      );

      this.logger.log(`Auto-enabled feature flag: ${flag.key}`);
      this.invalidateCache(flag.key);
    }

    // Find flags that should be auto-disabled
    const flagsToDisable = await this.featureFlagModel.find({
      scheduledDisableDate: { $lte: now },
      active: true,
    });

    for (const flag of flagsToDisable) {
      const environment = this.getCurrentEnvironment();
      await this.featureFlagModel.updateOne(
        { _id: flag._id },
        {
          $set: {
            [`${environment}.enabled`]: false,
            scheduledDisableDate: null, // Remove schedule
          },
        },
      );

      this.logger.log(`Auto-disabled feature flag: ${flag.key}`);
      this.invalidateCache(flag.key);
    }

    this.logger.log(
      `Scheduled flags processed: ${flagsToEnable.length} enabled, ${flagsToDisable.length} disabled`,
    );
  }
}
