/**
 * Provides core functions for managing and retrieving network information
 * from cloud provider and local environment
 *
 * @module core/network
 */

// Dependencies
const { EC2 } = require("aws-sdk")
const request = require("requestretry")

// Local Modules
const logger = require("../config/logger")
const env = require("../config/environment")

/**
 * Retrieves the public ip from any given network interface.
 *
 * When no interface is provided, returns undefined.
 *
 * @param {Object<string, any>} opts - Additional options
 * @param {string} [opts.eni] - Elastic Network Interface identifier
 *
 * @returns {undefined | string} - The public ip address for the given ENI
 */
async function getPublicIpFromNetworkInterface({ eni }) {
  if (!eni) return

  const service = getNetworkServiceObject()

  try {
    const params = {
      NetworkInterfaceIds: [eni],
    }

    const {
      NetworkInterfaces: interfaces,
    } = await service.describeNetworkInterfaces(params).promise()

    const ip = interfaces[0].Association.PublicIp

    logger.silly(`Network interface ${eni} found with public ip ${ip}`, {
      category: "network",
      ip,
    })

    return ip
  } catch (error) {
    logger.error("Could not retrieve public ip from network interface", {
      category: "network",
      error,
    })

    // Rethrow error since this represents an unrecoverable failure
    // in most cases and could not be ignored
    throw error
  }
}

/**
 * Sends a batch to a scraper running task and returns it's response body
 * or undefined if the given task fails to enter a healthy state.
 *
 * @param {string} host - The task host ipv4 address
 * @param {Object<string, any>} batch - The batch to be offloaded to the task (it must be a json serializable object)
 *
 * @returns {Object<string, any> | undefined} - The scrap result for the given task
 */
async function processBatch(host, batch) {
  try {
    if (await isTaskHealth(host)) {
      logger.info("Sending batch request to task", {
        category: "network",
        host,
        batch,
      })

      return await sendBatch(host, batch)
    } else {
      logger.warn("Task endpoint was not healthy, batch not sent!", {
        category: "network",
        host,
      })
    }
  } catch (error) {
    logger.error("Batch could not be sent to the task!", {
      category: "network",
      error,
    })

    throw error
  }
}

/**
 * Sends a batch to the given host
 *
 * @param {*} host - The task host ipv4 address
 * @param {*} batch - The batch to be offloaded to the task
 *
 * @returns {Promise<Object<string, any>>} - The response body after fully processing the given batch
 *
 * @static
 * @inner
 * @function
 */
async function sendBatch(host, batch) {
  const uri = `http://${host}:${env.taskPort}${env.taskPath}`

  // Disable retries for this particular endpoint
  const opts = {
    body: batch,
    json: true,
    retryDelay: 0,
    maxAttempts: 0,
    fullResponse: false,
  }

  return await request.post(uri, opts)
}

/**
 * Resolves when the task endpoint /status responds with a successfull http code.
 *
 * @param {*} host - The task host ipv4 address
 *
 * @returns {Promise<boolean>} - The task is healthy and ready for receiving requests
 *
 * @static
 * @inner
 * @function
 */
async function isTaskHealth(host) {
  const uri = `http://${host}:${env.taskPort}${env.taskHealthCheckPath}`

  const opts = {
    json: true,
    retryDelay: env.retryDelay,
    maxAttempts: env.maxAttempts,
    fullResponse: false,
  }

  return await request(uri, opts).then(status => status.up)
}

/**
 * Returns a service object for issuing api calls for inspecting the network
 *
 * @returns {AWS.EC2} A service object from which API calls should be issued
 *
 * @inner
 * @function
 *
 */
function getNetworkServiceObject() {
  return new EC2()
}

// Exports
module.exports = {
  getPublicIpFromNetworkInterface,
  processBatch,
}
