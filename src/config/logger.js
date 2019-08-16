/**
 * Implements everything log related
 *
 * @module config/logger
 */

const { format, createLogger, transports } = require("winston")
const { isProd, defaultMeta } = require("./environment")

/**
 * Creates a derived logger using winston.createLogger.
 *
 * By default, in production, logs are limited to info.
 * Locally all logs should appear in your console.
 *
 * @type {DerivedLogger}
 * @static
 * @constant
 */
const logger = new createLogger({
  level: isProd ? "info" : "silly",
  format: format.json(),
  exitOnError: false,
  defaultMeta,
})

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (isProd) {
  logger.add(
    new transports.Console({
      format: format.json(),
    }),
  )
} else {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({
          format: "DD-MM-YYYY HH:mm:ss",
        }),
        format.printf(msg => {
          const { timeElapsed, error, timestamp, level, message, context } = msg

          let out

          if (context && context.rental && context.id) {
            out = `${timestamp} - ${level} (${context.rental}, ${context.id}): ${message}`
          } else {
            out = `${timestamp} - ${level}: ${message}`
          }

          if (timeElapsed) out += ` (${timeElapsed}ms)`
          if (error && error.stack) out += `\n\n${error.stack}\n`
          if (error && error.code) out += ` (${error.code})`

          return out
        }),
      ),
    }),
  )
}

module.exports = logger
