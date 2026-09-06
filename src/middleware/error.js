import ErrorResponse from "../utils/errorResponse.js";
import logger from "../utils/logger.js";

// Error response handler - centralizes error handling
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

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
    const message = `Resource not found with value of ${error.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    const message = "Invalid token, please log in again";
    error = new ErrorResponse(message, 401);
  }

  if (error.name === "TokenExpiredError") {
    const message = "Token expired, please log in again";
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

export default errorHandler;