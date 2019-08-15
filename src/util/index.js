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

async function sendPayloadToTask(ip, payload) {
  let req = setupRequest(ip, "/", "POST")
  req.write(JSON.stringify(payload))
  return req.end()
}

function getProperty(p, o) {
  return p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o)
}

function setupRequest(ip, path, method) {
  return http.request(
    {
      host: ip,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    },
    res => {
      let buffers = []
      res.on("error", reject)
      res.on("data", buffer => buffers.push(buffer))
      res.on("end", () =>
        res.statusCode === 200
          ? resolve(Buffer.concat(buffers))
          : reject(Buffer.concat(buffers)),
      )
    },
  )
}

exports.getProperty = getProperty
exports.runTask = runTask
exports.endTask = endTask
exports.waitForTaskState = waitForTaskState
exports.getRunningTaskIP = getRunningTaskIP
exports.sendPayloadToTask = sendPayloadToTask
