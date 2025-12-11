// apps/admin-backend/src/utils/logger.ts
type LogLevel = "info" | "warn" | "error" | "debug" | "success";

interface LogOptions {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp?: boolean;
}

class Logger {
  private static formatMessage(
    level: LogLevel,
    message: string,
    data?: any
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = this.getPrefix(level);
    const baseMsg = `${timestamp} ${prefix} [Admin Backend] ${message}`;

    if (data !== undefined) {
      return `${baseMsg} ${JSON.stringify(data, null, 2)}`;
    }

    return baseMsg;
  }

  private static getPrefix(level: LogLevel): string {
    switch (level) {
      case "info":
        return "ℹ️";
      case "warn":
        return "⚠️";
      case "error":
        return "❌";
      case "debug":
        return "🔍";
      case "success":
        return "✅";
      default:
        return "•";
    }
  }

  private static shouldLog(level: LogLevel): boolean {
    // In production, skip debug logs
    const env = process.env.NODE_ENV || "development";
    if (env === "production" && level === "debug") {
      return false;
    }
    return true;
  }

  static info(message: string, data?: any): void {
    if (!this.shouldLog("info")) return;
    console.log(this.formatMessage("info", message, data));
  }

  static success(message: string, data?: any): void {
    if (!this.shouldLog("success")) return;
    console.log(this.formatMessage("success", message, data));
  }

  static warn(message: string, data?: any): void {
    if (!this.shouldLog("warn")) return;
    console.warn(this.formatMessage("warn", message, data));
  }

  static error(message: string, error?: any): void {
    if (!this.shouldLog("error")) return;
    const errorData =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error;
    console.error(this.formatMessage("error", message, errorData));
  }

  static debug(message: string, data?: any): void {
    if (!this.shouldLog("debug")) return;
    console.debug(this.formatMessage("debug", message, data));
  }

  // Special method for HTTP requests (compatible with morgan)
  static http(message: string): void {
    const env = process.env.NODE_ENV || "development";
    if (env !== "production") {
      console.log(message);
    }
  }
}

export { Logger };
