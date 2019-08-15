const AWS = require("aws-sdk")
const env = require("./config/environment")
const {
  runTask,
  waitForTaskState,
  sendPayloadToTask,
  getRunningTaskIP,
  getProperty,
} = require("./util")

exports.handler = async function(event, context) {
  const ecs = new AWS.ECS(env.awsAuthParams)

  console.log("Starting the configured task...")
  const startedTask = await runTask(ecs, env.taskParams)
  console.log(startedTask)

  console.log("Waiting for the task to be ready...")
  const waitResponse = await waitForTaskState(
    ecs,
    "tasksRunning",
    env.taskParams.cluster,
    getProperty(["tasks", 0, "taskArn"], startedTask),
  )
   console.log(waitResponse)

  console.log("Task is ready!")
  const taskIP = await getRunningTaskIP(
    ecs,
    env.taskParams.cluster,
    getProperty(["tasks", 0, "taskArn"], startedTask),
  )
  console.log(taskIP)

  const response = await sendPayloadToTask(taskIP, context)

  return response
}