import { Request, Response, NextFunction } from 'express';

import mongoose from 'mongoose';
import { config } from '../config';
import logger from '../config/logger';
import {
  ApiError,
  MongooseValidationError,
  MongooseCastError,
  MongooseGeneralError,
  InternalError,
} from '../handlers/api/errorres.handler';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // Log error details
  if (res.headersSent) {
    next(err);
    return;
  }

  logger.error('Error Handler:', {
    type: err.constructor.name,
    message: err.message,
    path: req.path,
    method: req.method,
    stack: config.isProduction ? undefined : err.stack,
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
    return;
  }

  // Convert Mongoose/MongoDB errors to our custom API errors
  if (err instanceof mongoose.Error.ValidationError) {
    const validationError = new MongooseValidationError(
      Object.values(err.errors)
        .map((err) => `${err.path}: ${err.message}`)
        .join(', ')
    );
    ApiError.handle(validationError, res);
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    const castError = new MongooseCastError(`Invalid ${err.path}: ${err.value}`);
    ApiError.handle(castError, res);
    return;
  }

  if (err instanceof mongoose.Error) {
    const mongooseError = new MongooseGeneralError(err.message);
    ApiError.handle(mongooseError, res);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    const { BadTokenError, TokenExpiredError } = require('../handlers/api/errorres.handler');
    const tokenError =
      err.name === 'TokenExpiredError' ? new TokenExpiredError() : new BadTokenError();
    ApiError.handle(tokenError, res);
    return;
  }

  // Handle unknown errors
  const internalError = new InternalError(
    config.isProduction ? 'Something went wrong' : err.message
  );
  ApiError.handle(internalError, res);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): Response => {
  const { NotFoundError } = require('../handlers/api/errorres.handler');
  const notFoundError = new NotFoundError(`Path ${req.originalUrl} not found`);
  return ApiError.handle(notFoundError, res);
};

// Global error handlers
export const setupGlobalErrorHandlers = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    if (reason instanceof Error) {
      logger.error('Unhandled Rejection:', {
        reason: reason?.message || reason,
        stack: reason?.stack,
      });
    } else {
      logger.error('Unhandled Rejection:', {
        reason: reason,
      });
    }
    process.exit(1);
  });
};
