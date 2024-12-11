import request from 'supertest';
import app from '../app'; // Ensure this exports your Express app

describe('API Endpoints', () => {
    it('GET /status should return 200 with the status message', async () => {
        const res = await request(app).get('/status');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ redis: true, db: true });
    });

    it('GET /stats should return 200 with correct stats', async () => {
        const res = await request(app).get('/stats');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('users');
        expect(res.body).toHaveProperty('files');
    });

    it('POST /users should create a new user', async () => {
        const res = await request(app).post('/users').send({ email: 'test@example.com', password: 'password' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('GET /connect should authenticate a user', async () => {
        const res = await request(app).get('/connect').auth('test@example.com', 'password');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('GET /disconnect should log out the user', async () => {
        const token = (await request(app).get('/connect').auth('test@example.com', 'password')).body.token;
        const res = await request(app).get('/disconnect').set('X-Token', token);
        expect(res.statusCode).toBe(204);
    });

    it('GET /users/me should retrieve the current user', async () => {
        const token = (await request(app).get('/connect').auth('test@example.com', 'password')).body.token;
        const res = await request(app).get('/users/me').set('X-Token', token);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('POST /files should upload a file', async () => {
        const token = (await request(app).get('/connect').auth('test@example.com', 'password')).body.token;
        const res = await request(app)
            .post('/files')
            .set('X-Token', token)
            .send({ name: 'file.txt', type: 'file', data: 'Hello World' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    it('GET /files should return files with pagination', async () => {
        const res = await request(app).get('/files?page=1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('PUT /files/:id/publish should publish a file', async () => {
        const token = (await request(app).get('/connect').auth('test@example.com', 'password')).body.token;
        const file = (await request(app).post('/files').set('X-Token', token).send({ name: 'file.txt', type: 'file', data: 'Hello World' })).body;
        const res = await request(app).put(`/files/${file.id}/publish`).set('X-Token', token);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('isPublic', true);
    });

    it('PUT /files/:id/unpublish should unpublish a file', async () => {
        const token = (await request(app).get('/connect').auth('test@example.com', 'password')).body.token;
        const file = (await request(app).post('/files').set('X-Token', token).send({ name: 'file.txt', type: 'file', data: 'Hello World' })).body;
        await request(app).put(`/files/${file.id}/publish`).set('X-Token', token);
        const res = await request(app).put(`/files/${file.id}/unpublish`).set('X-Token', token);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('isPublic', false);
    });

    it('GET /files/:id/data should return file content', async () => {
        const token = (await request(app).get('/connect').auth('test@example.com', 'password')).body.token;
        const file = (await request(app).post('/files').set('X-Token', token).send({ name: 'file.txt', type: 'file', data: 'Hello World' })).body;
        const res = await request(app).get(`/files/${file.id}/data`).set('X-Token', token);
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe('Hello World');
    });
});
