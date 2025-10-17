import { z } from 'zod';

/**
 * Environment Variables Validation Schema
 *
 * This schema validates all required environment variables at startup.
 * If any required variable is missing or invalid, the application will fail to start.
 */

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  PORT: z.string().default('3000'),

  // MongoDB
  MONGO_URL: z
    .string()
    .url('MONGO_URL must be a valid MongoDB connection string'),

  // JWT Authentication
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Stripe
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_PUBLIC_KEY: z
    .string()
    .startsWith('pk_', 'STRIPE_PUBLIC_KEY must start with pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Google Cloud Storage
  GCS_PROJECT_ID: z.string().min(1, 'GCS_PROJECT_ID is required'),
  GCS_BUCKET_NAME: z.string().min(1, 'GCS_BUCKET_NAME is required'),
  GCS_KEY_FILE: z.string().min(1, 'GCS_KEY_FILE path is required'),

  // Redis (for Bull queues)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),

  // Rate Limiting
  THROTTLE_TTL: z.string().default('60000'),
  THROTTLE_LIMIT: z.string().default('10'),

  // Email
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.string().optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().email().optional(),

  // CORS
  CORS_ORIGINS: z.string().optional(),

  // Swagger
  ENABLE_SWAGGER: z.string().optional(),

  // Blockchain (optional)
  RPC_URL: z.string().url().optional(),
  PRIVATE_KEY: z.string().startsWith('0x').optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment variables at application startup
 * @throws {Error} If validation fails
 */
export function validateEnv(): EnvConfig {
  try {
    const validated = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error(
        'Invalid environment configuration. Please check your .env file.',
      );
    }
    throw error;
  }
}
