import boto3

CLUSTER_NAME = "dear_cluster"
TASK_DEFINITION = "dear_task:1"
SUBNET = 'subnet-2ec3a94a'
SUBNET_ALT = 'subnet-413a9c6e'


def handler(event, context):
    client = boto3.client('ecs')

    request = client.run_task(
        cluster=CLUSTER_NAME,
        launchType='FARGATE',
        taskDefinition=TASK_DEFINITION,
        # The number of instantiations of the task on your cluster
        count=1,
        platformVersion='LATEST',
        networkConfiguration={
            'awsvpcConfiguration': {
                'subnets': [
                    SUBNET,
                    SUBNET_ALT
                ],
                'assignPublicIp': 'DISABLED'
            }
        },
        overrides={
            'containerOverrides': [
                
            ]
        }
    )

    return str(request)


def stop_task(client):
    return client.stop_task(
        cluster=CLUSTER_NAME,
        task=TASK_DEFINITION,
        reason='FINISHED PROCESSING BATCH'
    )
