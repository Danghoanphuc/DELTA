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

/**
 * Logger tùy chỉnh có màu sắc
 */
export const Logger = {
  log: (message, ...args) => {
    console.log(message, ...args);
  },

  success: (message, ...args) => {
    console.log(
      `${colors.fg.green}✅ [SUCCESS]${colors.reset}`,
      message,
      ...args
    );
  },

  error: (message, ...args) => {
    console.log(`${colors.fg.red}❌ [ERROR]${colors.reset}`, message, ...args);
  },

  warn: (message, ...args) => {
    console.log(
      `${colors.fg.yellow}⚠️ [WARN]${colors.reset}`,
      message,
      ...args
    );
  },

  info: (message, ...args) => {
    console.log(`${colors.fg.blue}ℹ️ [INFO]${colors.reset}`, message, ...args);
  },

  debug: (message, ...args) => {
    // Chỉ log debug nếu môi trường là development
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `${colors.fg.magenta}🐞 [DEBUG]${colors.reset}`,
        message,
        ...args
      );
    }
  },
};
