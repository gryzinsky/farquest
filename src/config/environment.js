require("dotenv").config()

const taskParams = {
  cluster: process.env.CLUSTER,
  taskDefinition: process.env.TASK_DEFINITION,
  launchType: process.env.LAUNCH_TYPE,
  networkConfiguration: {
    awsvpcConfiguration: {
      subnets: [process.env.SUBNET, process.env.SUBNET_ALT],
      assignPublicIp: process.env.ASSIGN_PUBLIC_IP,
      securityGroups: [process.env.SECURITY_GROUP],
    },
  },
}

const awsAuthParams = {
}

const taskPath = process.env.TASK_PATH
const taskRequestMethod = process.env.TASK_REQUEST_METHOD

module.exports = {
  taskParams,
  awsAuthParams,
  taskPath,
  taskRequestMethod
}
