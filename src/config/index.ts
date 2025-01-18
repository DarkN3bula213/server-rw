import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongo: {
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/docker-db?replicaSet=rs0",
    user: process.env.MONGO_USER || "devuser",
    pass: process.env.MONGO_PASS || "devpassword"
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  },
  env: process.env.NODE_ENV || "development"
};
