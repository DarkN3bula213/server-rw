// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as express from 'express';

declare module 'express' {
  // Inject additional properties on express.Request
  interface Request {
    user?: {
      id: string;
    };
    apiKey?: string;
  }
}

export {};
