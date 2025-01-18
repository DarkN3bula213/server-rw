import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/customError";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      status: "error",
      code: error.statusCode,
      message: error.message
    });
  } else {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal server error"
    });
  }
};
