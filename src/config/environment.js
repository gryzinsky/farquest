/**
 * Provides constants on initialization for managing the environment
 *
 * @module config/environment
 */

// Dependencies
const os = require("os")

/**
 * Configures how a task should be launch in the cluster
 *
 * @static
 * @constant
 * @type {Object<string, any>}
 */
const taskParams = {
  cluster: process.env.CLUSTER,
  taskDefinition: process.env.TASK_DEFINITION,
  launchType: process.env.LAUNCH_TYPE,
  networkConfiguration: {
    awsvpcConfiguration: {
      subnets: [process.env.SUBNET, process.env.SUBNET_ALT],
      assignPublicIp: process.env.ASSIGN_PUBLIC_IP,
      securityGroups: [process.env.SECURITY_GROUP],
    },
  },
}

/**
 * Returns true when NODE_ENV is set to production
 *
 * @static
 * @constant
 * @type {boolean}
 * */
const isProd = process.env.NODE_ENV === "production"

/**
 * The task running port
 *
 * @static
 * @constant
 * @type {number}
 * */
const taskPort = process.env.TASK_PORT || 3000

/**
 * The task scrap path
 *
 * @static
 * @constant
 * @type {string}
 * */
const taskPath = process.env.TASK_PATH || "/"

/**
 * The task health check path
 *
 * @static
 * @constant
 * @type {string}
 * */
const taskHealthCheckPath = process.env.TASK_HEALTH_CHECK_PATH || "/status"

/**
 * Globally configured timezone
 * Defaults to America/Sao_Paulo
 *
 * @static
 * @constant
 * @type {string}
 */
const timezone = process.env.TZ || "America/Sao_Paulo"

/**
 * Defines (in milliseconds) the time between request retries
 *
 * @static
 * @constant
 * @type {number}
 */
const retryDelay = process.env.RETRY_DELAY || 5000

/**
 * Defines the maximum number of attempts before considering
 * a request unfulfilled.
 *
 * @static
 * @constant
 * @type {number}
 */
const maxAttempts = process.env.MAX_ATTEMPTS || 5

/**
 * Default metadata for logging services
 *
 * @static
 * @constant
 * @type {Object.<string, any>}
 */
const defaultMeta = {
  service: "scraper",
  host: os.hostname(),
  arch: os.arch(),
  cpus: os.cpus().length,
  platform: os.platform(),
  totalmem: parseInt(os.totalmem() / 1000.0 ** 2) + "MB",
  category: "no-category",
}

// Exports
module.exports = {
  taskParams,
  isProd,
  timezone,
  retryDelay,
  taskPort,
  taskPath,
  taskHealthCheckPath,
  maxAttempts,
  defaultMeta,
}
