import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { HealthController } from '../../../src/controllers/health.controller';

describe('HealthController', () => {
  it('should return success status and healthy message', () => {
    const healthController = new HealthController();
    
    const mockRequest = {} as Request;
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    healthController.check(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: "success",
      message: "Server is healthy"
    });
  });
}); 