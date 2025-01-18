import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(compression());
  }

  private initializeRoutes(): void {
    this.app.use("/api", routes);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async connectToDatabase(): Promise<void> {
    const URI = `mongodb://${config.mongo.user}:${encodeURIComponent(config.mongo.pass)}@127.0.0.1:27017/docker-db?replicaSet=rs0`;

    try {
      await mongoose.connect(URI);
      console.log("Connected to database");
    } catch (error) {
      console.error("Database connection error:", error);
      process.exit(1);
    }
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  }
}

const server = new App();

server
  .connectToDatabase()
  .then(() => {
    server.listen();
  })
  .catch((error) => {
    console.error("Server initialization error:", error);
    process.exit(1);
  });

export default server.app;
