import { Router } from "express";
import healthRouter from "./health.routes";
// Import other route modules here

const router = Router();

router.use("/health", healthRouter);
// Add other routes here

export default router;
