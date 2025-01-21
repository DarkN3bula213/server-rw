import { beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { config } from '../src/config';
import app from '../src/app';
import supertest from 'supertest';

// const apiKey = 'haGv9z3ZNTwBfHBszfOjeu8q3ZfARGcN';
export const request = supertest(app);

beforeAll(async () => {
  await mongoose.connect(config.mongo.url);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoose.disconnect();
});
