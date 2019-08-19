const { getPublicIpFromNetworkInterface } = require("./network")
const { sendPayloadToTask } = require("./network")

const { runTask } = require("./task")
const { endTask } = require("./task")
const { waitForTaskState } = require("./task")
const { getTaskIP } = require("./task")
const { getTaskNetworkInterface } = require("./task")

// Exports
module.exports = {
  getPublicIpFromNetworkInterface,
  sendPayloadToTask,
  runTask,
  endTask,
  waitForTaskState,
  getTaskIP,
  getTaskNetworkInterface,
}
