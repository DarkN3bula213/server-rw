import { beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { config } from '../src/config';

beforeAll(async () => {
  await mongoose.connect(config.mongo.url);
});

afterAll(async () => {
  await mongoose.connection.close();
}); 