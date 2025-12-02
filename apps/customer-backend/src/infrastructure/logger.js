// ✅ Unified Logger with Winston + Logtail

import winston from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";

// Initialize Logtail if token is provided
let logtail = null;
if (process.env.LOGTAIL_TOKEN) {
  logtail = new Logtail(process.env.LOGTAIL_TOKEN);
}

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: "customer-backend",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add Logtail transport if available
if (logtail) {
  logger.add(new LogtailTransport(logtail));
  logger.info("[Logger] Logtail integration enabled");
} else {
  logger.warn("[Logger] LOGTAIL_TOKEN not set, logging to console only");
}

export default logger;
