import { BadRequestError, ForbiddenError } from '@/handlers/api/errorres.handler';
import { NextFunction, Response, Request } from 'express';
import ApiKeyModel from './apiKeys.model';

export const checkApiKey = async (req: Request, _res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey) return next(new ForbiddenError());

  const apiKeyModel = await ApiKeyModel.findOne({ key: apiKey });

  if (!apiKeyModel) {
    return next(new BadRequestError('No api key found'));
  }

  req.apiKey = apiKeyModel.key;
  next();
};
