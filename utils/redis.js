import { createClient } from 'redis';

class RedisClient {
  constructor() {
    // Creating a Redis client
    this.client = createClient();

    // Handling Redis errors
    this.client.on('error', (err) => {
      console.error(`Redis client error: ${err.message}`);
    });

    // Connecting to Redis
    this.client.connect().catch((err) => {
      console.error(`Failed to connect to Redis: ${err.message}`);
    });
  }

  // Checking if Redis client is connected
  isAlive() {
    return this.client.isReady;
  }

  // Get a value from Redis by key
  async get(key) {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error(`Failed to get key "${key}": ${err.message}`);
      return null;
    }
  }

  // Set a value in Redis by key with expiration
  async set(key, value, duration) {
    try {
      await this.client.set(key, value, { EX: duration });
    } catch (err) {
      console.error(`Failed to set key "${key}": ${err.message}`);
    }
  }

  // Remove a key from Redis
  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error(`Failed to delete key "${key}": ${err.message}`);
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
