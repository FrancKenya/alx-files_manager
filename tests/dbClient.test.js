import dbClient from '../utils/db';

describe('dbClient', () => {
    beforeAll(async () => {
        const usersCollection = dbClient.db.collection('users');
        await usersCollection.insertOne({ email: 'test@example.com', password: 'password' });
    });

    afterAll(async () => {
        const usersCollection = dbClient.db.collection('users');
        await usersCollection.deleteMany({ email: 'test@example.com' });
    });

    it('should connect to the database', () => {
        expect(dbClient.isAlive()).toBe(true);
    });

    it('should retrieve a document from the database', async () => {
        const usersCollection = dbClient.db.collection('users');
        const user = await usersCollection.findOne({ email: 'test@example.com' });
        expect(user).not.toBeNull();
        expect(user.email).toBe('test@example.com');
    });

    it('should count documents in a collection', async () => {
        const count = await dbClient.nbUsers();
        expect(count).toBeGreaterThan(0);
    });
});
