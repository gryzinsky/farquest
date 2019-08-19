/**
 * Provides core functions for handling fargate tasks
 *
 * @module core/task
 */

const env = require("../config/environment")
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
    .then(data => data)
    .catch(e => e)
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
    .then(data => data)
    .catch(e => e)
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
    .then(data => data)
    .catch(e => e)
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
  const taskDescription = await ecs
    .describeTasks({ tasks: [taskArn], cluster: cluster })
    .promise()

  if (public) {
    const eni = getProperty(
      ["tasks", 0, "attachments", 0, "details", 1, "value"],
      taskDescription,
    )

    const ec2 = new EC2(env.awsAuthParams)

    const publicIp = await ec2
      .describeNetworkInterfaceAttribute({
        Attribute: "PublicIp",
        NetworkInterfaceId: eni,
      })
      .promise()

    return publicIp
  } else {
    return getProperty(
      [
        "tasks",
        0,
        "containers",
        0,
        "networkInterfaces",
        0,
        "privateIpv4Address",
      ],
      taskDescription,
    )
  }
}

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
    const taskDescription = await service.describeTasks(params).promise()

    const { attachments } = taskDescription.tasks[0]

    return attachments
      .find(prop => prop.type === "ElasticNetworkInterface")
      .details.find((prop => prop.name === "networkInterfaceId").value)
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
