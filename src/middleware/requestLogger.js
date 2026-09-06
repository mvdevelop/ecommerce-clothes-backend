import morgan from "morgan";
import logger from "../utils/logger.js";

// Morgan stream that pipes HTTP logs to winston
const stream = {
  write: (message) => logger.http(message.trim()),
};

const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
};

const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);

export default requestLogger;