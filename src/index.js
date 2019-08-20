const AWS = require("aws-sdk")
const logger = require("./config/logger")
const env = require("./config/environment")

const {
  runTask,
  endTask,
  waitForTaskState,
  processBatch,
  getTaskIp,
} = require("./core")

exports.handler = async function(event, _context) {
  logger.info(
    `Starting ${env.taskParams.taskDefinition} task on ${env.taskParams.cluster} cluster!`,
    { category: "handler" },
  )

  let taskArn

  try {
    taskArn = await runTask()

    logger.warn(`Created task with arn: ${taskArn}`, {
      category: "handler",
      taskArn,
    })

    logger.info("Waiting for the task to be ready...", {
      category: "handler",
      taskArn,
    })

    await waitForTaskState("tasksRunning", taskArn)

    logger.warn("Task state changed to RUNNING", {
      category: "handler",
      taskArn,
    })

    const host = await getTaskIp(taskArn, {
      public: !env.isProd,
    })

    logger.warn("Sending batch request to task", {
      category: "handler",
      taskArn,
    })

    const response = await processBatch(
      host,
      env.taskPath,
      env.taskRequestMethod,
      _context,
    )

    logger.info(response)

    await endTask(taskArn)

    logger.info("Task state changed to STOPPED", {
      category: "handler",
      taskArn,
    })

    return response
  } catch (error) {
    logger.error("An unknown error happened", { category: "handler", error })

    if (taskArn) await endTask(taskArn)

    throw error
  }
}
