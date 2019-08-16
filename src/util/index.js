const http = require("http")

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

async function getRunningTaskIP(ecs, cluster, taskArn) {
  return await ecs
    .describeTasks({ tasks: [taskArn], cluster: cluster })
    .promise()
    .then(data => {
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
        data,
      )
    })
    .catch(e => e)
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
