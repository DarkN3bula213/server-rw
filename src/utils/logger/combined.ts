/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from 'node:fs';
import * as path from 'node:path';
import { createLogger, format, transports } from 'winston';
import colors from './colors';
import dayjs from 'dayjs';

const formattedTimestamp = format((info, _opts) => {
  info.timestamp = dayjs().format('| [+] | MM-DD HH:mm:ss');

  return info;
})();
const formatLevel = (level: string) => {
  switch (level) {
    case 'error':
      return colors.background.bgRed.node(level.toUpperCase());
    case 'warn':
      return colors.background.bgYellow.node(level.toUpperCase());
    case 'info':
      return colors.yellow(level.toUpperCase());
    case 'debug':
      return colors.blue(level.toUpperCase());
    default:
      return level.toUpperCase();
  }
};

const dir = path.resolve('logs');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

export class Logger {
  public static readonly DEFAULT_SCOPE = 'app';

  private static readonly logger = createLogger({
    level: 'debug',
    defaultMeta: {
      scope: Logger.DEFAULT_SCOPE,
    },
    transports: [
      new transports.Console({
        handleExceptions: true,
        handleRejections: true,
        format: format.combine(
          formattedTimestamp,
          format.errors({ stack: false }),
          format.splat(),
          format.printf((info) => {
            const timestamp = colors.grey(info.timestamp as string);
            const level = formatLevel(info.level);
            const messageColor = (colors as any)[`${info.level}Message`];
            const message = messageColor ? messageColor(info.message) : info.message;
            return `${timestamp} [${level}]: ${message}`;
          })
        ),
      }),
    ],
    exceptionHandlers: [
      new transports.File({
        filename: `exceptions-${dayjs().format('YYYY-MM-DD')}.log`,
        dirname: dir,
        format: format.combine(
          formattedTimestamp,
          format.errors({ stack: true }),
          format.uncolorize(),
          format.printf((info) => {
            return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
          })
        ),
      }),
    ],
    rejectionHandlers: [
      new transports.File({
        filename: `rejections-${dayjs().format('YYYY-MM-DD')}.log`,
        dirname: dir,
        format: format.combine(
          formattedTimestamp,
          format.errors({ stack: true }),
          format.uncolorize(),
          format.printf((info) => {
            return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
          })
        ),
      }),
    ],

    exitOnError: false,
  });
  private static parsePathToScope(filepath: string): string {
    let parsedPath = filepath;
    if (parsedPath.indexOf(path.sep) >= 0) {
      parsedPath = parsedPath.replace(process.cwd(), '');
      parsedPath = parsedPath.replace(`${path.sep}src${path.sep}`, '');
      parsedPath = parsedPath.replace(`${path.sep}dist${path.sep}`, '');
      parsedPath = parsedPath.replace('.ts', '');
      parsedPath = parsedPath.replace('.js', '');
      parsedPath = parsedPath.replace(path.sep, ':');
    }
    return parsedPath;
  }
  private readonly scope: string;

  constructor(scope?: string) {
    this.scope = Logger.parsePathToScope(scope ?? Logger.DEFAULT_SCOPE);
  }
  public debug(message: string | object, ...args: any[]): void {
    this.log('debug', message, args);
  }

  public info(message: string | object, ...args: any[]): void {
    this.log('info', message, args);
  }

  public warn(message: string | object, ...args: any[]): void {
    this.log('warn', message, args);
  }

  public error(message: string | object, ...args: any[]): void {
    this.log('error', message, args);
  }

  private log(level: string, message: string | object, _args: any[]): void {
    const MAX_DEPTH = 3; // Prevent deep nesting
    const MAX_ARRAY_LENGTH = 10; // Limit array output
    const MAX_STRING_LENGTH = 1000; // Limit string length

    const timestamp = colors.grey(dayjs().format('| [+] | MM-DD HH:mm:ss'));
    const prefix = `${timestamp} ${colors.cyan(':----:')}`;

    if (typeof message === 'object' && message !== null) {
      let formattedMessage = `${this.scope}\n`;
      const seen = new WeakSet(); // Track circular references

      const formatValue = (value: unknown, indent = '', depth = 0): string => {
        // Handle depth limit
        if (depth >= MAX_DEPTH) return colors.yellow('[Max Depth Reached]');

        // Handle null/undefined
        if (value === null) return colors.red('null');
        if (value === undefined) return colors.red('undefined');

        // Handle circular references
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return colors.yellow('[Circular Reference]');
          seen.add(value);
        }

        try {
          // Handle different types
          if (Array.isArray(value)) {
            const items = value
              .slice(0, MAX_ARRAY_LENGTH)
              .map((v) => formatValue(v, indent + '  ', depth + 1));
            const hasMore = value.length > MAX_ARRAY_LENGTH;
            const moreItemsText = hasMore ? ',\n  ... more items' : '';
            return (
              '[\n' +
              indent +
              '  ' +
              items.join(',\n' + indent + '  ') +
              moreItemsText +
              '\n' +
              indent +
              ']'
            );
          }

          if (typeof value === 'object') {
            const entries = Object.entries(value);
            const lines = entries.map(([k, v]) => {
              const coloredKey = colors.yellow(`"${k}"`);
              const formattedVal = formatValue(v, `${indent}  `, depth + 1);
              return `${indent}  ${coloredKey}: ${formattedVal}`;
            });
            return `{\n${lines.join(',\n')}\n${indent}}`;
          }

          if (typeof value === 'string') {
            const truncated =
              value.length > MAX_STRING_LENGTH
                ? value.slice(0, MAX_STRING_LENGTH) + '...[truncated]'
                : value;
            return colors.green(`"${truncated}"`);
          }

          if (typeof value === 'number') return colors.cyan(String(value));
          if (typeof value === 'boolean') return colors.blue(String(value));

          return String(value);
        } catch (_error) {
          return colors.red('[Error formatting value]');
        }
      };

      try {
        const lines = Object.entries(message).map(([key, value]) => {
          const coloredKey = colors.cyan(key);
          const formattedValue = formatValue(value)
            .split('\n')
            .map((line, i) => (i === 0 ? line : `${prefix} ${line}`))
            .join('\n');
          return `${prefix} ${coloredKey}: ${formattedValue}`;
        });

        formattedMessage += lines.join('\n');
        Logger.logger.log(level, formattedMessage);
      } catch (error) {
        Logger.logger.error(`Error formatting log message: ${error}`);
      }
    } else {
      Logger.logger.log({
        level,
        message:
          typeof message === 'string' ? message.slice(0, MAX_STRING_LENGTH) : String(message),
        timestamp: dayjs().format('| [+] | MM-DD HH:mm:ss'),
      });
    }
  }
}
