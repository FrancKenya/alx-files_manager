import redis from 'redis';
<<<<<<< HEAD
import { promisify } from 'util';
=======
>>>>>>> refs/remotes/origin/main

class RedisClient {
  constructor() {
    this.client = redis.createClient();
<<<<<<< HEAD
    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
=======
    this.client.on('error', (error) => {
      console.error(error);
    });
>>>>>>> refs/remotes/origin/main
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
<<<<<<< HEAD
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    return this.setAsync(key, value, 'EX', duration);
  }

  async del(key) {
    return this.delAsync(key);
=======
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async del(key) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, _reject) => {
      this.client.del(key, (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
>>>>>>> refs/remotes/origin/main
  }
}

const redisClient = new RedisClient();
export default redisClient;