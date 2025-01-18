import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('Health Check API', () => {
  it('should return 200 and healthy status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      status: 'success',
      message: 'Server is healthy'
    });
  });
}); 