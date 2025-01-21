import winston from 'winston';
import { config } from './index';
import colors from '../utils/logger/colors';
import dayjs from 'dayjs';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = config.env || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const formatLevel = (level: string): string => {
  const levelLower = level.toLowerCase();
  switch (levelLower) {
    case 'error':
      return colors.foreground.red(levelLower);
    case 'warn':
      return colors.foreground.yellow(levelLower);
    case 'info':
      return colors.foreground.cyan(levelLower);
    case 'debug':
      return colors.foreground.blue(levelLower);
    case 'verbose':
      return colors.foreground.magenta(levelLower);
    default:
      return colors.foreground.white(levelLower);
  }
};

// Format for console output (simplified)
const consoleFormat = winston.format.combine(
  winston.format.printf(({ level, message }) => {
    const formattedLevel = formatLevel(level);
    const timestamp = colors.grey(dayjs().format('| [+] | MM-DD HH:mm:ss'));
    return `${timestamp} [${formattedLevel}]: ${message}`;
  })
);

// Format for file output (detailed)
const fileFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

const logger = winston.createLogger({
  level: level(),
  levels,
  transports: [
    // Console transport (simplified output)
    new winston.transports.Console({
      format: consoleFormat,
      level: 'info', // Only show info and above in console
    }),

    // Error file transport (detailed output)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined logs file transport (detailed output)
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Prevent logger from exiting on error
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

export default logger;
