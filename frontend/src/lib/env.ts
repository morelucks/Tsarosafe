/**
 * Environment variable validation utility
 * Validates required environment variables at runtime using Zod
 */

import { z } from 'zod';

/**
 * Schema for environment variables
 * Add new required environment variables here
 */
const envSchema = z.object({
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z
    .string()
    .min(1, 'WalletConnect Project ID must not be empty')
    .optional(),
});

export type EnvValidationResult = {
  success: boolean;
  missingVars: string[];
  errors: Record<string, string[]>;
};

/**
 * Validates environment variables against the schema
 * @returns Validation result with missing variables and errors
 */
export const validateEnv = (): EnvValidationResult => {
  const env = {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  };

  const parsed = envSchema.safeParse(env);

  if (parsed.success) {
    return {
      success: true,
      missingVars: [],
      errors: {},
    };
  }

  // Extract missing and invalid variables
  const missingVars: string[] = [];
  const errors: Record<string, string[]> = {};

  parsed.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);

    // Check if variable is missing
    if (issue.code === 'invalid_type' && issue.received === 'undefined') {
      missingVars.push(path);
    }
  });

  return {
    success: false,
    missingVars,
    errors,
  };
};

/**
 * Checks if WalletConnect Project ID is configured
 * @returns true if configured, false otherwise
 */
export const isWalletConnectConfigured = (): boolean => {
  return (
    !!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID &&
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.length > 0
  );
};

/**
 * Logs environment validation results to console in development
 */
export const logEnvValidation = (): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const result = validateEnv();

  if (result.success) {
    console.log('✅ Environment variables validated successfully');
    return;
  }

  console.warn('⚠️  Environment validation warnings:');

  if (result.missingVars.length > 0) {
    console.warn('\n📋 Missing environment variables:');
    result.missingVars.forEach((varName) => {
      console.warn(`  - ${varName}`);
    });
  }

  if (Object.keys(result.errors).length > 0) {
    console.warn('\n❌ Validation errors:');
    Object.entries(result.errors).forEach(([varName, errors]) => {
      console.warn(`  ${varName}:`);
      errors.forEach((error) => {
        console.warn(`    - ${error}`);
      });
    });
  }

  console.warn(
    '\n💡 Check .env.example for required environment variables\n'
  );
};
