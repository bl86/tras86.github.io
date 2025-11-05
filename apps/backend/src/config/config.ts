/**
 * Application Configuration
 * Centralized configuration management using environment variables
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

/**
 * Configuration Schema using Zod for validation
 */
const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(3000),

  // Database
  databaseUrl: z.string(),

  // JWT
  jwt: z.object({
    secret: z.string().min(32),
    refreshSecret: z.string().min(32),
    expiresIn: z.string().default('15m'),
    refreshExpiresIn: z.string().default('7d'),
  }),

  // Redis
  redisUrl: z.string(),

  // MinIO
  minio: z.object({
    endpoint: z.string(),
    port: z.coerce.number(),
    useSSL: z.coerce.boolean().default(false),
    accessKey: z.string(),
    secretKey: z.string(),
    bucketName: z.string().default('accounting-files'),
  }),

  // CORS
  cors: z.object({
    origin: z.string().or(z.array(z.string())),
  }),

  // Rate Limiting
  rateLimit: z.object({
    windowMs: z.coerce.number().default(900000), // 15 minutes
    maxRequests: z.coerce.number().default(100),
  }),

  // Logging
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Email (Optional)
  smtp: z.object({
    host: z.string().optional(),
    port: z.coerce.number().optional(),
    user: z.string().optional(),
    password: z.string().optional(),
    from: z.string().optional(),
  }),

  // FIA API
  fia: z.object({
    apiUrl: z.string().optional(),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
  }),
});

/**
 * Parse and validate configuration
 */
const parseConfig = () => {
  try {
    return configSchema.parse({
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      databaseUrl: process.env.DATABASE_URL,
      jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      },
      redisUrl: process.env.REDIS_URL,
      minio: {
        endpoint: process.env.MINIO_ENDPOINT,
        port: process.env.MINIO_PORT,
        useSSL: process.env.MINIO_USE_SSL,
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY,
        bucketName: process.env.MINIO_BUCKET_NAME,
      },
      cors: {
        origin: process.env.CORS_ORIGIN,
      },
      rateLimit: {
        windowMs: process.env.RATE_LIMIT_WINDOW_MS,
        maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
      },
      logLevel: process.env.LOG_LEVEL,
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.SMTP_FROM,
      },
      fia: {
        apiUrl: process.env.FIA_API_URL,
        apiKey: process.env.FIA_API_KEY,
        apiSecret: process.env.FIA_API_SECRET,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Configuration validation failed:');
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Exported configuration object
 */
export const config = parseConfig();

/**
 * Type export for TypeScript
 */
export type Config = z.infer<typeof configSchema>;
