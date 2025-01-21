import logger from '../config/logger';
import mongoose, { ConnectOptions, Connection } from 'mongoose';
import { config } from '../config';

interface DatabaseConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  connectionTimeout: number;
  socketTimeout: number;
  minPoolSize: number;
  maxPoolSize: number;
  dbName: string;
}

class Database {
  private static instance: Database;
  private isConnecting: boolean = false;
  private reconnectTimeout?: NodeJS.Timeout;
  private readonly config: DatabaseConfig;

  private constructor() {
    this.config = {
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 30000,
      connectionTimeout: 60000,
      socketTimeout: 45000,
      minPoolSize: 5,
      maxPoolSize: 10,
      dbName: 'docker-db',
    };

    // Remove existing listeners to prevent duplicates
    mongoose.connection.removeAllListeners();
    this.setupEventListeners();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private getConnectionOptions(): ConnectOptions {
    return {
      autoIndex: true,
      minPoolSize: this.config.minPoolSize,
      maxPoolSize: this.config.maxPoolSize,
      connectTimeoutMS: this.config.connectionTimeout,
      socketTimeoutMS: this.config.socketTimeout,
      serverSelectionTimeoutMS: this.config.connectionTimeout,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
      dbName: this.config.dbName,
    };
  }

  private calculateBackoff(attempt: number): number {
    const delay = Math.min(this.config.initialDelay * Math.pow(2, attempt), this.config.maxDelay);
    return delay + Math.random() * 1000; // Add jitter
  }

  private setupEventListeners(): void {
    mongoose.connection.on('error', (error: Error) => {
      logger.error('MongoDB connection error:', error);
      this.isConnecting = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected, attempting to reconnect...');

      // Clear any existing reconnection timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      // Only attempt reconnection if not already connecting
      if (!this.isConnecting) {
        this.reconnectTimeout = setTimeout(() => {
          this.connect().catch((err) => logger.error('Failed to reconnect after disconnect:', err));
        }, 5000); // Wait 5 seconds before attempting to reconnect
      }
    });

    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
      this.isConnecting = false;

      // Clear any existing reconnection timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = undefined;
      }
    });

    // Clean up on process termination
    process.once('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  public async connect(): Promise<void> {
    if (this.isConnecting) {
      logger.warn('Connection attempt already in progress');
      return;
    }

    this.isConnecting = true;
    const URI = config.mongo.url;
    const options = this.getConnectionOptions();

    for (let attempt = 0; attempt < this.config.maxAttempts; attempt++) {
      try {
        await mongoose.connect(URI, options);
        logger.info('Successfully connected to MongoDB');
        return;
      } catch (error) {
        if (attempt === this.config.maxAttempts - 1) {
          this.isConnecting = false;
          throw new Error(
            `Failed to connect to MongoDB after ${this.config.maxAttempts} attempts: ${error}`
          );
        }

        const delay = this.calculateBackoff(attempt);
        logger.warn(
          `Connection attempt ${attempt + 1}/${this.config.maxAttempts} failed. ` +
            `Retrying in ${Math.round(delay / 1000)}s...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  public async disconnect(): Promise<void> {
    try {
      // Clear any reconnection timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = undefined;
      }

      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
      }
    } catch (error) {
      logger.error('Error during MongoDB disconnect:', error);
      throw error;
    }
  }

  public getConnection(): Connection {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      throw new Error('No active MongoDB connection');
    }
    return mongoose.connection;
  }

  public isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export default Database.getInstance();
