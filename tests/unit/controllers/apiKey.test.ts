import { describe, it, expect } from 'vitest';

import { request } from '../../setup';

const apiKey = 'haGv9z3ZNTwBfHBszfOjeu8q3ZfARGcN';
const defaultHeaders = {
  Origin: 'http://localhost:3000',
  'x-api-key': apiKey,
};

const badKey = 'badKey';
const badHeaders = {
  Origin: 'http://localhost:3000',
  'x-api-key': badKey,
};

describe('checkApiKey', () => {
  it('It should return a bad request if apiKey is not found', async () => {
    await request.get('/api/health').set(badHeaders).expect(400);
  });
  it('should call next with ForbiddenError if apiKey is not found', async () => {
    const response = await request
      .get('/api/health')
      .set(defaultHeaders)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual({
      status: 'success',
      message: `Server is healthy, key: ${apiKey}`,
    });
  });
});
