const request = require('supertest');

// Mock db BEFORE importing app
jest.mock('../src/db', () => ({
    connect: jest.fn(),
    query: jest.fn(),
}));
const pool = require('../src/db');

const app = require('../src/app');

describe('API Integration Tests', () => {

    // Setup default mock implementation
    beforeEach(() => {
        pool.query.mockReset();
    });

    test('GET /api/books should return 200', async () => {
        pool.query.mockResolvedValue({ rows: [] });
        const res = await request(app).get('/api/books');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    test('GET /health should return ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('ok');
    });
});
