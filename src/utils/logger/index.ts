import { Application } from 'express';
import { logger } from 'express-winston';
import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, meta }) => {
    const metaStr = meta && Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

export const handleLogs = (app: Application): void => {
  app.use(
    logger({
      transports: [new winston.transports.Console()],
      format: logFormat,
      meta: true,
      msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
      expressFormat: false,
      colorize: true,
      ignoreRoute: (req) => {
        // Ignore health check endpoints to reduce noise
        return req.url.includes('/health');
      },
    })
  );
};
