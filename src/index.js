const AWS = require("aws-sdk")
const http = require("http")
const env = require("./config/environment")

const getProperty = p => o =>
  p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o)

async function runTask(ecs) {
  return await ecs.runTask(env.taskParams, (err, data) => {
    return err ? { err: err, stack: err.stack } : data
  })
}

async function waitForTaskState(ecs, state, taskArn) {
  return await ecs.waitFor(state, { tasks: [taskArn] }, (err, data) => {
    return err ? { err: err, stack: err.stack } : data
  })
}

async function sendPayloadToTask(ip, payload) {
  let req = setupRequest(ip, "/", "POST")
  req.write(JSON.stringify(payload))
  return req.end()
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

exports.handler = async function(event, context) {
  const ecs = new AWS.ECS(env.awsAuthParams)

  const startedTask = await runTask(ecs)

  if (startedTask.err) {
    return startedTask
  }

  const waitResponse = await waitForTaskState(
    ecs,
    "tasksRunning",
    getProperty(["tasks", 0, "taskArn"], startedTask),
  )

  if (waitResponse.err) {
    return waitResponse
  }

  const request = await sendPayloadToTask(
    getProperty(
      ["tasks", 0, "containers", 0, "networkInterfaces", 0, "privateIpAddress"],
      waitResponse,
    ),
    context,
  )

  return request
}
