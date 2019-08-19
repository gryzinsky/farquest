const http = require("http")

const { EC2, ECS } = require("aws-sdk")
const env = require("../config/environment")

const ec2 = new EC2(env.awsAuthParams)
const ecs = new ECS(env.awsAuthParams)

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
 * Retrieves the public ip from any given network interface
 *
 * @param {string} eni - Elastic Network Interface identifier
 * 
 * @returns {string} - A task's IP
 */
async function getIp({ eni }) {
  if (!eni) return

  try {
    const params = {
      NetworkInterfaceIds: [eni],
    }

    const {
      NetworkInterfaces: interfaces,
    } = await ec2.describeNetworkInterfaces(params).promise()

    return interfaces[0].Association.PublicIp
  } catch (error) {
    logger.error("Could not retrieve public ip from interface", {
      category: "cloud-provider",
      error,
    })
    throw error
  }
}

/**
 * Returns the IP for a already-running task
 *
 * @param {string} cluster - The name of the cluster
 * @param {string} taskArn - The task's unique amazon resource name
 * 
 * @param {Object<string, any>} opts - Additional options
 * @param {boolean}[opts.public] - Configures the retrieval of a public IP or not. Defaults to false.
 * 
 * @returns {string} - A task's IP
 */
async function getRunningTaskIP(cluster, taskArn, { public = false }) {
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
 * Returns an object's property
 *
 * @param {Array[string]} p - The object's deep property chained in a array of strings
 * @param {Object<string, any>} payload - The property's object
 * 
 * @returns {string}
 */
function getProperty(p, o) {
  return p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o)
}

/**
 * Returns a configured http request options
 *
 * @param {string} ip - An IP
 * @param {string} path - The path the request is going to hit
 * @param {string} method - The request method
 * 
 * @returns {Object<string, any>}
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

exports.getProperty = getProperty
exports.runTask = runTask
exports.endTask = endTask
exports.waitForTaskState = waitForTaskState
exports.getRunningTaskIP = getRunningTaskIP
exports.sendPayloadToTask = sendPayloadToTask
