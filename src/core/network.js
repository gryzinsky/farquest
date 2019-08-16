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

// Exports
module.exports = {
  getPublicIpFromNetworkInterface,
}
