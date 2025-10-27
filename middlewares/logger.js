// middlewares/logger.js
const morgan = require("morgan");
const { createLogger, format, transports } = require("winston");
const path = require("path");
const winston = require("winston/lib/winston/config");
const { error, debug } = require("console");
const stripAnsi = require("strip-ansi").default;

winston.addColors({
  error: "bold red",
  warn: "yellow",
  info: "green",
  debug: "blue",
});
// Winston setup for file logs
const logger = createLogger({
  format: format.combine(
    format.colorize({ all: true }),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),

  transports: [
    new transports.File({
      filename: path.join(__dirname, "../logs/combined.log"),
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) => {
          return JSON.stringify({
            timestamp,
            level: stripAnsi(level),
            message: stripAnsi(message),
          });
        })
      ),
    }),
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(
          ({ timestamp, level, message }) =>
            `[${timestamp}] ${level}: ${message}`
        )
      ),
    }),

    // File transport (plain JSON)

    new transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
        format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) => {
          return JSON.stringify({
            timestamp,
            level: stripAnsi(level),
            message: stripAnsi(message),
          });
        })
      ),
      level: "error",
    }),
  ],
});

// Morgan setup for console + file stream
const morganMiddleware = morgan("dev", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

module.exports = { logger, morganMiddleware };
