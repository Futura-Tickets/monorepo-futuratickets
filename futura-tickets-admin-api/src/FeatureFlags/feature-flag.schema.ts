import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeatureFlagDocument = FeatureFlag & Document;

/**
 * Feature Flag targeting rules
 * Allows granular control of feature access
 */
export class TargetingRule {
  @Prop({ type: String, enum: ['user', 'role', 'email', 'percentage'], required: true })
  type: 'user' | 'role' | 'email' | 'percentage';

  @Prop({ type: [String], default: [] })
  values: string[]; // User IDs, roles, emails, etc.

  @Prop({ type: Number, min: 0, max: 100 })
  percentage?: number; // For percentage rollouts (0-100)
}

/**
 * Environment-specific configuration
 */
export class EnvironmentConfig {
  @Prop({ type: Boolean, default: false })
  enabled: boolean;

  @Prop({ type: [TargetingRule], default: [] })
  targeting: TargetingRule[];
}

/**
 * Feature Flag Schema
 *
 * Controls feature availability across the application
 * Supports:
 * - Environment-specific toggles (dev, staging, production)
 * - User/role targeting
 * - Percentage rollouts
 * - Scheduled releases
 */
@Schema({
  timestamps: true,
  collection: 'feature_flags',
})
export class FeatureFlag {
  @Prop({ type: String, required: true, unique: true })
  key: string; // Unique identifier (e.g., 'enable_resale_marketplace')

  @Prop({ type: String, required: true })
  name: string; // Human-readable name

  @Prop({ type: String })
  description: string; // What this feature does

  @Prop({ type: EnvironmentConfig, default: {} })
  development: EnvironmentConfig;

  @Prop({ type: EnvironmentConfig, default: {} })
  staging: EnvironmentConfig;

  @Prop({ type: EnvironmentConfig, default: {} })
  production: EnvironmentConfig;

  @Prop({ type: Date })
  scheduledEnableDate?: Date; // Auto-enable on this date

  @Prop({ type: Date })
  scheduledDisableDate?: Date; // Auto-disable on this date

  @Prop({ type: String, enum: ['development', 'beta', 'stable', 'deprecated'], default: 'development' })
  status: 'development' | 'beta' | 'stable' | 'deprecated';

  @Prop({ type: [String], default: [] })
  tags: string[]; // For categorization (e.g., 'payment', 'ui', 'experimental')

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  createdBy: Types.ObjectId; // Who created this flag

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  lastModifiedBy: Types.ObjectId; // Who last modified

  @Prop({ type: Date })
  lastEvaluatedAt?: Date; // Last time flag was checked

  @Prop({ type: Number, default: 0 })
  evaluationCount: number; // How many times flag was evaluated

  @Prop({ type: Boolean, default: true })
  active: boolean; // Master switch (overrides all environments)
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);

// Indexes for performance
FeatureFlagSchema.index({ key: 1 }, { unique: true });
FeatureFlagSchema.index({ active: 1 });
FeatureFlagSchema.index({ status: 1 });
FeatureFlagSchema.index({ tags: 1 });
FeatureFlagSchema.index({ scheduledEnableDate: 1 });
FeatureFlagSchema.index({ scheduledDisableDate: 1 });
