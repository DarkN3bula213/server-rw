import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import routes from './routes';
import logger from './config/logger';
import database from './db';
import { handleLogs } from './utils/logger';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middleware/errorHandler';
import { morganMiddleware } from './config/morgan';
import { checkApiKey } from './modules/apiKeys/apiKeys.controller';
class App {
  private static instance: App | null = null;
  public readonly app: Application;
  private readonly database: typeof database;

  constructor() {
    this.app = express();
    this.database = database;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeGracefulShutdown();
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(morganMiddleware);
    this.app.use(checkApiKey);
    handleLogs(this.app);
  }

  private initializeRoutes(): void {
    this.app.use('/api', routes);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private initializeGracefulShutdown(): void {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        try {
          await this.shutdown();
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    });

    process.on('uncaughtException', async (error) => {
      logger.error('Uncaught Exception:', error);
      await this.shutdown();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason) => {
      logger.error('Unhandled Rejection:', reason);
      await this.shutdown();
      process.exit(1);
    });
  }

  private async shutdown(): Promise<void> {
    logger.info('Shutting down server...');
    await this.database.disconnect();
    // Add any other cleanup tasks here
  }

  public async initialize(): Promise<void> {
    try {
      await this.database.connect();
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      throw error;
    }
  }
  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }
  public listen(): void {
    this.initialize();
    const server = this.app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });

    server.on('error', (error: Error) => {
      logger.error('Server error:', error);
      this.shutdown().finally(() => process.exit(1));
    });
  }
}

export default App.getInstance().app;
