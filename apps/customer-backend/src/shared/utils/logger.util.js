// src/shared/utils/logger.util.js

// Định nghĩa mã màu ANSI
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
  },
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
  },
};

// Log levels: ERROR=0, WARN=1, INFO=2, DEBUG=3
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Determine log level from environment
const getLogLevel = () => {
  const env = process.env.NODE_ENV;
  const configLevel = process.env.LOG_LEVEL;

  // Explicit LOG_LEVEL takes precedence
  if (configLevel) {
    return LOG_LEVELS[configLevel.toUpperCase()] ?? LOG_LEVELS.INFO;
  }

  // Default: production = WARN, development = INFO
  return env === "production" ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;
};

const currentLogLevel = getLogLevel();

// Debounce map for rate-limited logging
const debounceMap = new Map();

/**
 * Logger tùy chỉnh có màu sắc với log level control
 */
export const Logger = {
  log: (message, ...args) => {
    console.log(message, ...args);
  },

  success: (message, ...args) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log(
        `${colors.fg.green}✅ [SUCCESS]${colors.reset}`,
        message,
        ...args
      );
    }
  },

  error: (message, ...args) => {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      console.log(
        `${colors.fg.red}❌ [ERROR]${colors.reset}`,
        message,
        ...args
      );
    }
  },

  warn: (message, ...args) => {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.log(
        `${colors.fg.yellow}⚠️ [WARN]${colors.reset}`,
        message,
        ...args
      );
    }
  },

  info: (message, ...args) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log(
        `${colors.fg.blue}ℹ️ [INFO]${colors.reset}`,
        message,
        ...args
      );
    }
  },

  debug: (message, ...args) => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.log(
        `${colors.fg.magenta}🐞 [DEBUG]${colors.reset}`,
        message,
        ...args
      );
    }
  },

  /**
   * Log with debounce - useful for rate limit errors
   * @param {string} key - Unique key for debouncing
   * @param {number} intervalMs - Debounce interval in milliseconds (default: 60000 = 1 minute)
   * @param {Function} logFn - Logger function to call (e.g., Logger.error)
   * @param {string} message - Log message
   * @param  {...any} args - Additional arguments
   */
  debounced: (key, intervalMs = 60000, logFn, message, ...args) => {
    const now = Date.now();
    const lastLog = debounceMap.get(key);

    if (!lastLog || now - lastLog > intervalMs) {
      debounceMap.set(key, now);
      logFn(message, ...args);
    }
  },
};
