const http = require("http")

const { EC2, ECS } = require("aws-sdk")
const env = require("../config/environment")

const ec2 = new EC2(env.awsAuthParams)
const ecs = new ECS(env.awsAuthParams)

async function runTask(ecs, taskParams) {
  return await ecs
    .runTask(taskParams)
    .promise()
    .then(data => data)
    .catch(e => e)
}

async function endTask(ecs, cluster, taskArn) {
  return await ecs
    .stopTask({ task: taskArn, cluster: cluster })
    .promise()
    .then(data => data)
    .catch(e => e)
}

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

function getProperty(p, o) {
  return p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o)
}

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
