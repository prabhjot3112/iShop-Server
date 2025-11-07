const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const stripAnsi = require('strip-ansi');

const { combine, timestamp, printf, colorize } = winston.format;

// Detect if we’re running on Vercel (read-only filesystem)
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_ENV;

class Logger {
  constructor() {
    const logFormat = printf(({ timestamp, level, message }) => {
      return `${timestamp} ${stripAnsi(level.toUpperCase())}: ${stripAnsi(message)}`;
    });

    const transports = [
      new winston.transports.Console({
        format: combine(
          colorize({ all: true }),
          timestamp(),
          logFormat
        ),
      }),
    ];

    // Add file logging only if not on Vercel
    if (!isVercel) {
      transports.push(
        new DailyRotateFile({
          filename: 'logs/%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          format: combine(timestamp(), logFormat),
        })
      );

      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          format: combine(timestamp(), logFormat),
        })
      );
    } else {
      console.log('[Logger] Running on Vercel → File logging disabled.');
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: combine(timestamp(), logFormat),
      transports,
    });
  }

  info(message) {
    this.logger.info(message);
  }

  warn(message) {
    this.logger.warn(message);
  }

  error(message) {
    this.logger.error(message);
  }
}

module.exports = new Logger();
