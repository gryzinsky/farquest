/**
 * Provides core functions for handling fargate tasks
 *
 * @module core/task
 */

const env = require("../config/environment")
const { getPublicIpFromNetworkInterface } = require("./network")

/**
 * Retrieves the private or public ip (based on opts.public)
 * from any given task running within a cluster.
 *
 * The cluster is taken from process.env.CLUSTER and no
 * overriding is provided in the current moment.
 *
 * @param {string} id - The task identifier (ARN)
 * @param {Object<string, any>} opts - Additional options
 * @param {boolean} [opts.public=false] - When true, retrieves the public address associated with the task
 *
 * @returns {string} The ip address associated with the task (public or private depending upon opts.public)
 */
async function getTaskIp(id, { public = false }) { }

/**
 * Get task network metadata
 *
 * @param {string} id - The task identifier (ARN)
 * @returns {{privateIp: string, eni: string }}
 */
async function getTaskNetworkInterface(id) {
  const service = getContainerServiceObject()

  const params = {
    tasks: [id],
    cluster: env.taskParams.cluster,
  }

  try {
  const taskDescription = await service
    .describeTasks(params)
    .promise()

    const { attachments } = taskDescription.tasks[0]

    return attachments.find(prop => prop.type === "ElasticNetworkInterface").details.find((prop => prop.name === "networkInterfaceId").value
  } catch (error) {
    throw error
  }
}

/**
 * Returns a service object for issuing api calls for managing containers
 *
 * @returns {AWS.ECS} A service object from which API calls should be issued
 *
 * @inner
 * @function
 *
 */
function getContainerServiceObject() {
  return new ECS()
}

// Exports
module.exports = {}
