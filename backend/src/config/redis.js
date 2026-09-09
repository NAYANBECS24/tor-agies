const logger = require('../utils/logger');

// Simple Redis client for development
// In production, you would use actual Redis connection

let redisClient = null;

const connectRedis = async () => {
  try {
    // For development, we skip actual Redis connection
    if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
      const redis = require('redis');
      redisClient = redis.createClient({
        url: process.env.REDIS_URL
      });
      
      redisClient.on('error', (err) => {
        logger.error(`Redis Client Error: ${err}`);
      });
      
      redisClient.on('connect', () => {
        logger.info('Redis Client Connected');
      });
      
      await redisClient.connect();
      logger.info('✅ Redis connected successfully');
    } else {
      logger.info('⚠️ Redis connection skipped (development mode)');
      // Create a mock client for development
      redisClient = {
        get: async (key) => {
          logger.debug(`Redis GET ${key} (mock)`);
          return null;
        },
        set: async (key, value, options) => {
          logger.debug(`Redis SET ${key} (mock)`);
          return 'OK';
        },
        del: async (key) => {
          logger.debug(`Redis DEL ${key} (mock)`);
          return 1;
        },
        exists: async (key) => {
          logger.debug(`Redis EXISTS ${key} (mock)`);
          return 0;
        },
        expire: async (key, seconds) => {
          logger.debug(`Redis EXPIRE ${key} ${seconds}s (mock)`);
          return 1;
        },
        connected: false,
        isReady: false,
        mode: 'mock'
      };
    }
    
    return redisClient;
  } catch (error) {
    logger.error(`Redis connection failed: ${error.message}`);
    // Return mock client even if connection fails
    return {
      get: async () => null,
      set: async () => 'OK',
      del: async () => 1,
      exists: async () => 0,
      expire: async () => 1,
      connected: false,
      isReady: false,
      mode: 'error-mock'
    };
  }
};

const getRedisClient = () => {
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };