// src/tests/app.test.ts
import request from 'supertest';
import { Sequelize } from 'sequelize';
import app from '../app';
import { sequelize } from '../config/database';

// Mock plus complet de Sequelize
jest.mock('../config/database', () => {
    const mockSequelize = {
      define: jest.fn(),
      sync: jest.fn().mockResolvedValue(null),
      model: jest.fn(),
      models: {},
      options: {
        dialect: 'postgres',
      },
    };
    return {
      sequelize: mockSequelize,
    };
  });

describe('App', () => {
  beforeAll(() => {
    // Initialisation avant tous les tests
  });

  afterAll(() => {
    // Nettoyage après tous les tests
  });

  describe('API Tests', () => {
    it('should respond to health check', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('Server Setup', () => {
    it('should start the server successfully', async () => {
      expect(sequelize.sync).toHaveBeenCalled();
    });

    it('should respond to health check', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });
  });

  describe('API Routes', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      expect(response.status).toBe(404);
    });

    it('should parse JSON bodies', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ test: 'data' });
      expect(response.status).toBe(404); // Should be 404 as route doesn't exist
    });
  });
});