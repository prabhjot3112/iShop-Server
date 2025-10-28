// middlewares/logger.js
const morgan = require("morgan");
const { createLogger, format, transports } = require("winston");
const path = require("path");
const winston = require("winston/lib/winston/config");
const { error, debug, time } = require("console");
const stripAnsi = require("strip-ansi").default;

const DailyRotateFile = require('winston-daily-rotate-file')



const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${stripAnsi(level.toUpperCase())} ${stripAnsi(message)}`
    // return JSON.stringify({
    //   timestamp,
    //   level: stripAnsi(level),
    //   message: stripAnsi(message),
    // });
  })
);
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
     new DailyRotateFile({
      filename: path.join(__dirname, "../logs/%DATE%-combined.log"),
      datePattern: "YYYY-MM-DD",
      level:'info',
      zippedArchive: true,
      maxSize: "20m",
      format: logFormat,
    }),

     // Daily rotated file for errors
    new DailyRotateFile({
      filename: path.join(__dirname, "../logs/%DATE%-error.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      format: logFormat,
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


  ],
});

// Morgan setup for console + file stream
const morganMiddleware = morgan((tokens, req, res) => {
  return JSON.stringify({
        method: tokens.method(req, res),
            url: tokens.url(req, res),
              status: tokens.status(req, res),
               responseTime: tokens["response-time"](req, res) + "ms",

    domain: req.hostname,       // <-- logs the domain
  });
}, { stream: { write: message => logger.info(message) } });


module.exports = { logger, morganMiddleware };
