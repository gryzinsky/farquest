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
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}

const taskPath = process.env.TASK_PATH
const taskRequestMethod = process.env.TASK_REQUEST_METHOD

module.exports = {
  taskParams,
  awsAuthParams,
  taskPath,
  taskRequestMethod
}
