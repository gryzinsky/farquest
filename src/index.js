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

exports.handler = async function(event, context) {
  /*
  const ecs = new AWS.ECS(env.awsAuthParams)

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
    const taskIP = await getRunningTaskIP(ecs, env.taskParams.cluster, taskArn)
    console.log(`Got the following task ip: ${taskIP}`)

    console.log('Ok! Sending payload! Chooooooo')
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
    return error
  }
  */

  console.log("Ok! Sending payload! Chooooooo")
  const response = sendPayloadToTask(
    "3.89.164.169",
    env.taskPath,
    env.taskRequestMethod,
    fillContext(),
  )

  // console.log(response)
  // await endTask(ecs, env.taskParams.cluster, taskArn)
  // console.log("Task killed!")
  return response
}

function fillContext() {
  return {
    proxy: null,
    batch: [
      {
        rental: "movida",
        id: "1",
        store: "guarulhos",
        withdrawalTime: "10:00",
        returnTime: "10:00",
        offset: 1,
        lor: 1,
      },
    ],
  }
}
