import redisClient from '../utils/redis';

describe('redisClient', () => {
    beforeAll(async () => {
        await redisClient.set('testKey', 'testValue');
    });

    afterAll(async () => {
        await redisClient.del('testKey');
    });

    it('should retrieve a value from Redis', async () => {
        const value = await redisClient.get('testKey');
        expect(value).toBe('testValue');
    });

    it('should delete a key from Redis', async () => {
        await redisClient.del('testKey');
        const value = await redisClient.get('testKey');
        expect(value).toBe(null);
    });

    it('should set a key-value pair in Redis', async () => {
        await redisClient.set('newKey', 'newValue');
        const value = await redisClient.get('newKey');
        expect(value).toBe('newValue');
        await redisClient.del('newKey');
    });
});
