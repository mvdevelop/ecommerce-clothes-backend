import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

// Load environment variables
dotenv.config();

// Import routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Import middleware
import errorHandler from "./middleware/error.js";
import ErrorResponse from "./utils/errorResponse.js";
import requestLogger from "./middleware/requestLogger.js";
import connectDB from "./config/db.js";

// Initialize app
const app = express();

// Connect Database
connectDB();

// Body parser
app.use(express.json({ limit: "10kb" }));

// Request logger (HTTP)
app.use(requestLogger);

// Security Middleware
app.use(helmet());
app.use(cors());

// Prevent HTTP parameter pollution
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 10 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Sanitize data
app.use(mongoSanitize());

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "..", "upload", "images")));

// Mount routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new ErrorResponse(`Can't find ${req.originalUrl} on this server`, 404));
});

// Error handler (must be last)
app.use(errorHandler);

export default app;