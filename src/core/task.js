/**
 * Provides core functions for handling fargate tasks
 *
 * @module core/task
 */

const { ECS } = require("aws-sdk")

const { getPublicIpFromNetworkInterface } = require("./network")

/**
 * Starts the environment configured task on a existing cluster
 *
 * @param {AWS.ECS} ecs - Elastic Container Service instance
 * @param taskParams - Task runner configuration
 *
 * @returns {AWS.Request}
 */
async function runTask(ecs, taskParams) {
  return await ecs
    .runTask(taskParams)
    .promise()
}

/**
 * Stops a already-running task on a cluster
 *
 * @param {AWS.ECS} ecs - Elastic Container Service instance
 * @param {string} cluster - The name of the cluster
 * @param {string} taskArn - The task's unique amazon resource name
 *
 * @returns {AWS.Request}
 */
async function endTask(ecs, cluster, taskArn) {
  return await ecs
    .stopTask({ task: taskArn, cluster: cluster })
    .promise()
}

/**
 * Waits until a task is set to a desired state
 *
 * @param {AWS.ECS} ecs - Elastic Container Service instance
 * @param {string} state - Desired task state
 * @param {string} cluster - The name of the cluster
 * @param {string} taskArn - The task's unique amazon resource name
 *
 * @returns {AWS.Request}
 */
async function waitForTaskState(ecs, state, cluster, taskArn) {
  return await ecs
    .waitFor(state, { tasks: [taskArn], cluster: cluster })
    .promise()
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
 * @param {boolean} [opts.public=false] - When true, retrieves the public address associated with the task
 *
 * @returns {string} The ip address associated with the task (public or private depending upon opts.public)
 */
async function getTaskIP(cluster, taskArn, { public = false }) {
  const taskMetadata = await getTaskNetworkInterface(taskArn, cluster)

  if (public) {
    return await getPublicIpFromNetworkInterface({eni: taskMetadata.eni})
  } else {
    return taskMetadata.privateIp
  }
}

/**
 * Get task network metadata
 *
 * @param {string} id - The task identifier (ARN)
 * @param {string} cluster - The cluster name
 *
 * @returns {{privateIp: string, eni: string }}
 */
async function getTaskNetworkInterface(id, cluster) {
  const service = getContainerServiceObject()

  const params = {
    tasks: [id],
    cluster: cluster,
  }

  try {
    const taskDescription = await service.describeTasks(params).promise()

    const { attachments } = taskDescription.tasks[0]
    const networkData = attachments[0].details
      .filter(
        o =>
          (o.name === "networkInterfaceId") | (o.name === "privateIPv4Address"),
      )
      .map(e => e.value)

    return { privateIp: networkData[1], eni: networkData[0] }
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
module.exports = {
  runTask,
  endTask,
  waitForTaskState,
  getTaskIP,
  getTaskNetworkInterface,
}
