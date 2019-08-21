/**
 * Provides core functions for handling fargate tasks
 *
 * @module core/task
 */

// Dependencies
const { ECS } = require("aws-sdk")

// Local modules
const env = require("../config/environment")
const { getPublicIpFromNetworkInterface } = require("./network")

/**
 * Starts the environment configured task on a existing cluster
 *
 * @returns {string} - The running task identifier (ARN)
 */
async function runTask() {
  const service = getContainerServiceObject()

  return await service
    .runTask(env.taskParams)
    .promise()
    .then(response => response.tasks[0].taskArn)
}

/**
 * Stops a running task
 *
 * @param {string} id - The task identifier (ARN)
 *
 * @returns {AWS.Request}
 */
async function endTask(id) {
  const service = getContainerServiceObject()
  const opts = { task: id, cluster: env.taskParams.cluster }

  return await service.stopTask(opts).promise()
}

/**
 * Waits until a task is in a desired state
 *
 * @param {string} state - Desired task state
 * @param {string} id - The task identifier (ARN)
 *
 * @returns {AWS.Request}
 */
async function waitForTaskState(state, id) {
  const service = getContainerServiceObject()
  const opts = { tasks: [id], cluster: env.taskParams.cluster }

  return await service.waitFor(state, opts).promise()
}

/**
 * Retrieves the private or public ip (based on opts.public)
 * from any given task running within a cluster.
 *
 * The cluster is taken from process.env.CLUSTER and no
 * overriding is provided in the current moment.
 *
 * @param {string} id - The task identifier (ARN)
 * @param {Object<string, any>} opts - Additional options
 * @param {boolean} [opts.publicAddress=false] - When true, retrieves the public address associated with the task
 *
 * @returns {string} The ip address associated with the task (public or private depending upon opts.public)
 */
async function getTaskIp(id, { publicAddress = false } = {}) {
  const { eni, privateIp } = await getTaskNetworkInterface(id)

  if (publicAddress) {
    return await getPublicIpFromNetworkInterface({ eni })
  } else {
    return privateIp
  }
}

/**
 * Get task network metadata
 *
 * @param {string} id - The task identifier (ARN)
 *
 * @returns {{privateIp: string, eni: string }}
 */
async function getTaskNetworkInterface(id) {
  const service = getContainerServiceObject()

  const params = {
    tasks: [id],
    cluster: env.taskParams.cluster,
  }

  const taskDescription = await service.describeTasks(params).promise()

  const { attachments } = taskDescription.tasks[0]

  const networkData = attachments[0].details
    .filter(
      o =>
        (o.name === "networkInterfaceId") | (o.name === "privateIPv4Address"),
    )
    .map(e => e.value)

  return { privateIp: networkData[1], eni: networkData[0] }
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
module.exports = {
  runTask,
  endTask,
  waitForTaskState,
  getTaskIp,
  getTaskNetworkInterface,
}
