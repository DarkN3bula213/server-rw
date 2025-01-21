import { describe, it, expect } from 'vitest';

import { request } from '../setup';

const apiKey = 'haGv9z3ZNTwBfHBszfOjeu8q3ZfARGcN';

const defaultHeaders = {
  Origin: 'http://localhost:3000',
  'x-api-key': apiKey,
};

describe('Health Check API', () => {
  it('should return 200 and healthy status', async () => {
    const response = await request.get('/api/health').set(defaultHeaders);

    expect(response.body).toEqual({
      status: 'success',
      message: `Server is healthy, key: ${apiKey}`,
    });
  });
});
