// import winston from 'winston';
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
// import DailyRotateFile from 'winston-daily-rotate-file';
const stripAnsi = require('strip-ansi');

const { combine, timestamp, printf, colorize } = winston.format;

class Logger {
    logger;
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: combine(
                timestamp(),
                printf(({ timestamp, level, message }) => {
                    return `${timestamp} ${stripAnsi(level.toUpperCase())}: ${stripAnsi(message)}`;
                })
            ),
            transports: [
                new winston.transports.Console({
                    format: combine(
                        timestamp(),
                        printf(({ timestamp, level, message }) => {
                            return `${timestamp} ${stripAnsi(level.toUpperCase())}: ${stripAnsi(message)}`;
                        }),
                        colorize({ all: true })
                    ),
                }),
                new DailyRotateFile({
                    filename: 'logs/%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    level: 'info',
                    format: combine(
                        timestamp(),
                        printf(({ timestamp, level, message }) => {
                            return `${timestamp} ${stripAnsi(level.toUpperCase())}: ${stripAnsi(message)}`;
                        })
                    ),
                }),
                new DailyRotateFile({
                    filename: 'logs/error-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    level: 'error',
                    format: combine(
                        timestamp(),
                        printf(({ timestamp, level, message }) => {
                            return `${timestamp} ${level.toUpperCase()}: ${message}`;
                        })
                    ),
                }),
            ],
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

module.exports =  new Logger();
