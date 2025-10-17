/**
 * Environment Variables Validation
 *
 * This module validates that all required environment variables are set
 * and provides type-safe access to them.
 *
 * Run this validation at app startup to fail fast if configuration is missing.
 */

interface EnvironmentVariables {
  // Backend APIs
  NEXT_PUBLIC_FUTURA_API: string;
  NEXT_PUBLIC_FUTURA: string;
  NEXT_PUBLIC_REFACTOR_RESALE_API: string;

  // External Services
  NEXT_PUBLIC_BLOB_URL: string;
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: string;

  // Optional
  NEXT_PUBLIC_SENTRY_DSN?: string;
  NEXT_PUBLIC_GTM_ID?: string;
}

/**
 * Validates that a required environment variable exists and returns it
 */
function getRequiredEnvVar(key: keyof EnvironmentVariables): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please check your .env.local file and ensure ${key} is set.\n` +
      `See .env.example for reference.`
    );
  }

  return value;
}

/**
 * Validates that an optional environment variable is properly formatted if set
 */
function getOptionalEnvVar(key: keyof EnvironmentVariables): string | undefined {
  return process.env[key] || undefined;
}

/**
 * Validates URL format
 */
function validateUrl(url: string, varName: string): void {
  try {
    new URL(url);
  } catch (error) {
    throw new Error(
      `Invalid URL format for ${varName}: ${url}\n` +
      `Please provide a valid HTTP/HTTPS URL.`
    );
  }
}

/**
 * Validates and exports all environment variables
 * Call this at app startup to ensure configuration is valid
 */
export function validateEnvironment(): EnvironmentVariables {
  // Required variables
  const NEXT_PUBLIC_FUTURA_API = getRequiredEnvVar('NEXT_PUBLIC_FUTURA_API');
  const NEXT_PUBLIC_FUTURA = getRequiredEnvVar('NEXT_PUBLIC_FUTURA');
  const NEXT_PUBLIC_REFACTOR_RESALE_API = getRequiredEnvVar('NEXT_PUBLIC_REFACTOR_RESALE_API');
  const NEXT_PUBLIC_BLOB_URL = getRequiredEnvVar('NEXT_PUBLIC_BLOB_URL');
  const NEXT_PUBLIC_GOOGLE_CLIENT_ID = getRequiredEnvVar('NEXT_PUBLIC_GOOGLE_CLIENT_ID');

  // Validate URL formats
  validateUrl(NEXT_PUBLIC_FUTURA_API, 'NEXT_PUBLIC_FUTURA_API');
  validateUrl(NEXT_PUBLIC_FUTURA, 'NEXT_PUBLIC_FUTURA');
  validateUrl(NEXT_PUBLIC_REFACTOR_RESALE_API, 'NEXT_PUBLIC_REFACTOR_RESALE_API');
  validateUrl(NEXT_PUBLIC_BLOB_URL, 'NEXT_PUBLIC_BLOB_URL');

  // Validate Google Client ID format
  if (!NEXT_PUBLIC_GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
    console.warn(
      `Warning: NEXT_PUBLIC_GOOGLE_CLIENT_ID doesn't match expected format.\n` +
      `Expected format: *.apps.googleusercontent.com`
    );
  }

  // Optional variables
  const NEXT_PUBLIC_SENTRY_DSN = getOptionalEnvVar('NEXT_PUBLIC_SENTRY_DSN');
  const NEXT_PUBLIC_GTM_ID = getOptionalEnvVar('NEXT_PUBLIC_GTM_ID');

  // Log configuration in development
  if (process.env.NODE_ENV === 'development') {
    console.log(' Environment variables validated successfully');
    console.log('=á API Endpoints:');
    console.log(`   - FUTURA_API: ${NEXT_PUBLIC_FUTURA_API}`);
    console.log(`   - FUTURA: ${NEXT_PUBLIC_FUTURA}`);
    console.log(`   - RESALE_API: ${NEXT_PUBLIC_REFACTOR_RESALE_API}`);
    console.log(`   - BLOB_URL: ${NEXT_PUBLIC_BLOB_URL}`);

    if (NEXT_PUBLIC_SENTRY_DSN) {
      console.log('= Sentry enabled');
    }
    if (NEXT_PUBLIC_GTM_ID) {
      console.log('=Ê Google Tag Manager enabled');
    }
  }

  return {
    NEXT_PUBLIC_FUTURA_API,
    NEXT_PUBLIC_FUTURA,
    NEXT_PUBLIC_REFACTOR_RESALE_API,
    NEXT_PUBLIC_BLOB_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GTM_ID,
  };
}

/**
 * Type-safe access to environment variables
 * Use this instead of process.env directly
 */
export const env = {
  get FUTURA_API() {
    return getRequiredEnvVar('NEXT_PUBLIC_FUTURA_API');
  },
  get FUTURA() {
    return getRequiredEnvVar('NEXT_PUBLIC_FUTURA');
  },
  get REFACTOR_RESALE_API() {
    return getRequiredEnvVar('NEXT_PUBLIC_REFACTOR_RESALE_API');
  },
  get BLOB_URL() {
    return getRequiredEnvVar('NEXT_PUBLIC_BLOB_URL');
  },
  get GOOGLE_CLIENT_ID() {
    return getRequiredEnvVar('NEXT_PUBLIC_GOOGLE_CLIENT_ID');
  },
  get SENTRY_DSN() {
    return getOptionalEnvVar('NEXT_PUBLIC_SENTRY_DSN');
  },
  get GTM_ID() {
    return getOptionalEnvVar('NEXT_PUBLIC_GTM_ID');
  },
} as const;
