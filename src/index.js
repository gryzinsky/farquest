const AWS = require("aws-sdk")
const env = require("./config/environment")
const {
  runTask,
  endTask,
  waitForTaskState,
  sendPayloadToTask,
  getRunningTaskIP,
  getProperty,
} = require("./util")

exports.handler = async function(_event, _context) {
  const ecs = new AWS.ECS(env.awsAuthParams)
  const ec2 = new AWS.EC2(env.awsAuthParams)

  console.log("Starting the configured task...")

  try {
    const startedTask = await runTask(ecs, env.taskParams)
    const taskArn = getProperty(["tasks", 0, "taskArn"], startedTask)

    console.log(
      `Created task with arn: ${getProperty(
        ["tasks", 0, "taskArn"],
        startedTask,
      )}`,
    )

    console.log(`Waiting for the task to be ready...`)

    await waitForTaskState(ecs, "tasksRunning", env.taskParams.cluster, taskArn)

    console.log("Task is running!")
    const taskIP = await getRunningTaskIP(env.taskParams.cluster, taskArn, {
      public: process.env.NODE_ENV !== "production",
    })

    console.log(`Got the following task ip: ${taskIP}`)

    console.log("Ok! Sending payload! Chooooooo")
    const response = await sendPayloadToTask(
      taskIP,
      env.taskPath,
      env.taskRequestMethod,
      fillContext(),
    )
    // await endTask(ecs, env.taskParams.cluster, taskArn)
    console.log("Task killed!")

    // return response
  } catch (error) {
    console.error(error)
    return error
  }

  await endTask(ecs, env.taskParams.cluster, taskArn)
  console.log("Task killed!")
}
