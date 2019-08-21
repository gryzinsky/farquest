const { getPublicIpFromNetworkInterface, sendMessage } = require("./network")

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
  sendMessage,
  runTask,
  endTask,
  waitForTaskState,
  getTaskIp,
  getTaskNetworkInterface,
}
