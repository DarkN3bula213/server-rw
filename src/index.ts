import app from './app';
import http from 'http';
import { config } from './config';
import database from './db';
import logger from './config/logger';

const server = http.createServer(app);

async function startServer() {
  await database.connect();
  server.listen(config.port, () => {
    logger.info(`Server is running on port ${config.port}`);
  });
}

startServer();
