/**
 * Implements the lambda handler function and process managment
 *
 * @module core/handler
 */
// Dependencies
const exit = require("async-exit-hook")

// Local Modules
const logger = require("./config/logger")
const env = require("./config/environment")

const {
  runTask,
  endTask,
  waitForTaskState,
  processBatch,
  getTaskIp,
} = require("./core")

/***
 * Handle graceful shutdown
 */
exit(async shutdown => {
  logger.warn(
    "Process received a signal for terminating, finishing any running tasks.",
    {
      category: "handler",
    },
  )

  if (global.taskArn) {
    logger.info(`Stopping task ${global.taskArn}`, {
      category: "handler",
      taskArn,
    })

    await endTask(global.taskArn)

    logger.info("Task state desired status changed to STOPPED", {
      category: "handler",
      taskArn: global.taskArn,
    })
  }

  shutdown()
})

/**
 * Implements the lambda handler
 *
 * @param {Object<any,any>} event - The source event that trigerred the function
 * @param {Object<any, any>} _context - The context of the lambda execution
 *
 * @returns {Promise<Object<any,any>>} - The lambda output
 */
exports.handler = async function(event, _context) {
  logger.info("Received source event, started processing...", {
    category: "handler",
    event,
  })

  logger.info(
    `Starting ${env.taskParams.taskDefinition} task on ${env.taskParams.cluster} cluster!`,
    { category: "handler" },
  )

  try {
    global.taskArn = await runTask()

    const { taskArn } = global

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

    const response = await processBatch(
      host,
      env.taskPath,
      env.taskRequestMethod,
      _context,
    )

    return response
  } catch (error) {
    logger.error("An unknown error happened", { category: "handler", error })

    throw error
  }
}
