/**
 * Provides core functions for managing and retrieving network information
 * from cloud provider and local environment
 *
 * @module core/network
 */

// Dependencies
const { EC2 } = require("aws-sdk")

// Local Modules
const logger = require("../config/logger")

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

    return interfaces[0].Association.PublicIp
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

/**
 * Sends a custom payload to a running task and returns it's response
 *
 * @param {string} ip - The task's IP
 * @param {string} taskPath - The path the request is going to hit
 * @param {string} method - The request method
 * @param {Object<string, any>} payload - The payload, as a JSON
 *
 * @returns {Object<string, any>}
 */
async function sendPayloadToTask(ip, taskPath, method, payload) {
  try {
    const data = await new Promise((resolve, reject) => {
      const req = http.request(setupOptions(ip, taskPath, method), res => {
        let buffer = ""

        res.on("data", chunk => (buffer += chunk))
        res.on("end", () => {
          try {
            resolve(JSON.parse(buffer))
          } catch (e) {
            reject(e)
          }
        })
      })

      req.write(JSON.stringify(payload))
      req.end()
    })

    return data
  } catch (error) {
    console.log("Could not send the payload to the task!")
    return error
  }
}

/**
 * Returns a configured http request options
 *
 * @param {string} ip - An IP
 * @param {string} path - The path the request is going to hit
 * @param {string} method - The request method
 *
 * @returns {Object<string, any>}
 *
 * @inner
 * @function
 */
function setupOptions(ip, path, method) {
  return {
    host: ip,
    path: path,
    method: method,
    port: 3000,
    timeout: 300000,
    headers: {
      "Content-Type": "application/json",
    },
  }
}

// Exports
module.exports = {
  getPublicIpFromNetworkInterface,
  sendPayloadToTask,
}
