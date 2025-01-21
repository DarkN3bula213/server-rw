import * as dotenv from 'dotenv';
import * as path from 'node:path';
import Joi from 'joi';
import { getDevelopmentEnv, getOsEnv, normalizePort } from '@/utils/env.utils';
dotenv.config({
  path: path.join(process.cwd(), `.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`),
});
const envVarsSchema = Joi.object({
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string().required().description('Mongo DB url'),
  MONGO_USER: Joi.string().required().description('Mongo DB user'),
  MONGO_PASS: Joi.string().required().description('Mongo DB password'),
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_EXPIRES_IN: Joi.string().required().description('JWT expiration time'),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
}).unknown();

const { error } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  port: normalizePort(getOsEnv('PORT')),
  mappedIP: getDevelopmentEnv('MAPPED_IP', '::ffff:127.0.0.1'),
  isProduction: getOsEnv('NODE_ENV') === 'production',
  isTest: getOsEnv('NODE_ENV') === 'test',
  isDevelopment: getOsEnv('NODE_ENV') === 'development',
  mongo: {
    url: getOsEnv('MONGODB_URI'),
    user: getOsEnv('MONGO_USER'),
    pass: getOsEnv('MONGO_PASS'),
  },
  jwt: {
    secret: getOsEnv('JWT_SECRET'),
    expiresIn: getOsEnv('JWT_EXPIRES_IN'),
  },
  env: getOsEnv('NODE_ENV'),
};
