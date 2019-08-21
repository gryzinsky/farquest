/**
 * Implements the lambda handler function and process managment
 *
 * @module core/handler
 */
// Dependencies
const hook = require("async-exit-hook")

// Local Modules
const logger = require("./config/logger")
const env = require("./config/environment")

const { getBatch } = require("./util")

const {
  runTask,
  endTask,
  waitForTaskState,
  processBatch,
  getTaskIp,
} = require("./core")

// Save all running task arns for shutdown
const taskArns = new Map()

/**
 * A function to handle any pending tasks and perform graceful shutdown
 *
 * @param {Function<void>} [shutdown] - A callback for closing the system
 */
async function beforeExit(shutdown) {
  if (taskArns.size === 0) return

  logger.warn(
    "Process received a signal for terminating or handler finished, finishing any running tasks...",
    {
      category: "graceful-shutdown",
    },
  )

  logger.silly(
    `Stopping ${taskArns.size} task${taskArns.size !== 1 ? "s" : ""}...`,
    {
      category: "graceful-shutdown",
    },
  )

  const closingTasks = Array.from(taskArns.keys())
    .map(endTask)
    .map(promise =>
      promise
        .then(response => {
          const { taskArn } = response.task

          taskArns.delete(taskArn)
          logger.info(`Task ${taskArn} desired status changed to STOPPED`, {
            category: "graceful-shutdown",
            taskArn: taskArn,
          })
        })
        .catch(error => {
          logger.error(`Error when changing desired task status to STOPPED`, {
            category: "graceful-shutdown",
            error,
          })
        }),
    )

  await Promise.all(closingTasks).then(() => {
    logger.silly("Calling shutdown callback...", {
      category: "graceful-shutdown",
    })
    if (shutdown && typeof shutdown === "function") shutdown()
  })
}

/**
 * Process any given message
 *
 * @param {Object<any, any>} message
 */
async function processMessage(message) {
  const batch = getBatch(message)
  const { messageId } = batch

  let taskArn

  logger.info(`Processing message ${messageId}...`, {
    category: "handler",
    messageId,
  })

  try {
    taskArn = await runTask()

    taskArns.set(taskArn)

    logger.warn(`Created task with arn: ${taskArn}`, {
      category: "handler",
      taskArn,
      messageId,
    })

    logger.info(`Waiting for the task ${taskArn} to be ready...`, {
      category: "handler",
      taskArn,
      messageId,
    })

    await waitForTaskState("tasksRunning", taskArn)

    logger.warn(`Task ${taskArn} state changed to RUNNING`, {
      category: "handler",
      taskArn,
      messageId,
    })

    const host = await getTaskIp(taskArn, {
      public: !env.isProd,
    })

    return await processBatch(host, batch)
  } catch (error) {
    logger.error("An unknown error happened", {
      category: "handler",
      error,
      messageId,
      taskArn,
    })

    throw error
  }
}

/**
 * Implements the lambda handler
 *
 * @param {Object<any,any>} event - The source event that trigerred the function
 * @param {Object<any, any>} _context - The context of the lambda execution
 *
 * @returns {Promise<Object<any,any>>} - The lambda output
 */
exports.handler = async function(event, _context) {
  const { Records: messages } = event

  logger.info(
    `Received source event with ${messages.length} message${
      messages.length > 1 ? "s" : ""
    }, started processing...`,
    {
      category: "handler",
      event,
    },
  )

  const result = await Promise.all(messages.map(processMessage))

  await beforeExit()

  return { result }
}

/***
 * Handler for graceful shutdown
 */
hook(beforeExit)
