import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

export class ErrorResponse extends Error {
  statusCode: number;
  success: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err } as Error & { statusCode?: number; code?: string; name?: string };
  error.message = err.message;
  error.name = err.name;

  // Log error with structured logger
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  // Mongoose bad ObjectId
  if (error.name === "CastError") {
    const message = `Resource not found with value`;
    error = new ErrorResponse(message, 404) as typeof error;
  }

  // Mongoose duplicate key
  if (error.code === "11000" || (error as any).code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400) as typeof error;
  }

  // Mongoose validation error
  if (error.name === "ValidationError" || err.name === "ValidationError") {
    const message = Object.values((err as any).errors || {})
      .map((val: any) => val.message)
      .join(", ");
    error = new ErrorResponse(message || "Validation error", 400) as typeof error;
  }

  // JWT errors
  if (error.name === "JsonWebTokenError" || err.name === "JsonWebTokenError") {
    error = new ErrorResponse("Invalid token, please log in again", 401) as typeof error;
  }

  if (error.name === "TokenExpiredError" || err.name === "TokenExpiredError") {
    error = new ErrorResponse("Token expired, please log in again", 401) as typeof error;
  }

  res.status((error as any).statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

export default errorHandler;