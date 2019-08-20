const { getPublicIpFromNetworkInterface, processBatch } = require("./network")

const {
  runTask,
  endTask,
  waitForTaskState,
  getTaskIp,
  getTaskNetworkInterface,
} = require("./task")

// Exports
module.exports = {
  getPublicIpFromNetworkInterface,
  processBatch,
  runTask,
  endTask,
  waitForTaskState,
  getTaskIp,
  getTaskNetworkInterface,
}
