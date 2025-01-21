import { config } from '.';
// import logger from './logger';
import morgan from 'morgan';
import { Request, Response } from 'express';

import dayjs from 'dayjs';

import { getCleanIp } from '../utils/morgan.utils';

import colors from '@/utils/logger/colors';

if (!config.isTest) {
  morgan.token('auth', (req: Request) => {
    const tokenFromCookie = req.cookies.access;
    const tokenFromHeader = req.headers.authorization?.split(' ')[1];
    const token = tokenFromCookie || tokenFromHeader;
    return token ? 'Auth' : 'No Auth';
  });
}

morgan.token('colored-method', (req) => {
  const method = req.method ?? 'GET';
  switch (method) {
    case 'GET':
      return colors.green(method);
    case 'POST':
      return colors.blue(method);
    case 'PUT':
      return colors.yellow(method);
    case 'DELETE':
      return colors.red(method);
    default:
      return colors.grey(method);
  }
});

morgan.token('colored-status', (_req: Request, res: Response) => {
  const status = res.statusCode;
  // Status code color coding
  if (status >= 500) return colors.red(status.toString()); // Server Error
  if (status >= 400) return colors.yellow(status.toString()); // Client Error
  if (status >= 300) return colors.cyan(status.toString()); // Redirect
  if (status >= 200) return colors.green(status.toString()); // Success
  return colors.grey(status.toString()); // Other
});

// Add a token for colored auth status
morgan.token('colored-auth', (req: Request) => {
  const tokenFromCookie = req.cookies.access;
  const tokenFromHeader = req.headers.authorization?.split(' ')[1];
  const token = tokenFromCookie || tokenFromHeader;
  return token ? colors.green('Auth') : colors.red('No Auth');
});

morgan.format('myFormat', (tokens, req: Request, res: Response) => {
  const timestamp = colors.grey(dayjs().format('| [+] | MM-DD HH:mm:ss'));
  const method = tokens['colored-method'](req, res);
  const url = tokens.url(req, res);
  const status = tokens['colored-status'](req, res);
  const responseTime = tokens['response-time'](req, res);
  const authStatus = tokens['colored-auth'](req, res);
  const ip = colors.cyan(getCleanIp(req));

  return `${timestamp} [${method}]: ${url} - ${authStatus} - Status: ${status} - ${responseTime} ms IP: ${ip}`;
});

// const winstonStream = {
//   write: (message: string) => {
//     logger.info(message.trim());
//   },
// };
export const morganMiddleware = [
  morgan('myFormat'), // Console output with colors
];
