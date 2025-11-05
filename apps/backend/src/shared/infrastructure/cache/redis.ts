/**
 * Redis Client Configuration
 * Used for caching and queue management
 */

import { createClient } from 'redis';
import { config } from '@/config/config';
import { logger } from '@/shared/infrastructure/logger';

/**
 * Create Redis client
 */
export const redisClient = createClient({
  url: config.redisUrl,
});

/**
 * Error handler
 */
redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

/**
 * Connection handler
 */
redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

/**
 * Cache helper functions
 */
export const cache = {
  /**
   * Get value from cache
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set value in cache
   */
  set: async (key: string, value: any, ttl?: number): Promise<void> => {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await redisClient.setEx(key, ttl, stringValue);
      } else {
        await redisClient.set(key, stringValue);
      }
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  },

  /**
   * Delete key from cache
   */
  del: async (key: string): Promise<void> => {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  },

  /**
   * Delete keys by pattern
   */
  delPattern: async (pattern: string): Promise<void> => {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  },

  /**
   * Check if key exists
   */
  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },
};
