import { createClient } from 'redis';

class RedisClient {
    constructor() {
        this.client = createClient();
        this.ready = false; // Initial connection state is false

        this.client.on('connect', () => {
            console.log('Redis client connected successfully');
            this.ready = true; // Set to true when the connection is successful
        });

        this.client.on('error', (err) => {
            console.error('Redis client error:', err);
        });

        this.client.connect().catch((err) => {
            console.error('Redis connection error:', err);
        });
    }

    isAlive() {
        return this.client.isOpen && this.ready; // Check both isOpen and ready
    }

    async get(key) {
        try {
            return await this.client.get(key);
        } catch (err) {
            console.error(`Redis GET error: ${err.message}`);
            return null;
        }
    }

    async set(key, value, duration) {
        try {
            await this.client.set(key, value, {
                EX: duration,
            });
        } catch (err) {
            console.error(`Redis SET error: ${err.message}`);
        }
    }

    async del(key) {
        try {
            await this.client.del(key);
        } catch (err) {
            console.error(`Redis DEL error: ${err.message}`);
        }
    }
}

const redisClient = new RedisClient();
export default redisClient;
