import {
  DescribeTasksCommand,
  ECSClient,
  RunTaskCommand,
  RunTaskCommandInput,
  Task,
} from '@aws-sdk/client-ecs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { EventBridgeEvent } from 'aws-lambda';

export const getTaskDetails = async (
  event: EventBridgeEvent<'ECS Task State Change', Task>,
) => {
  const client = new ECSClient({});
  const input = {
    cluster: event['detail']['clusterArn'] as string,
    tasks: [event['detail']['taskArn'] as string],
  };
  const command = new DescribeTasksCommand(input);
  const data = await client.send(command);
  if (!data['tasks']) {
    return false;
  }
  return data['tasks'][0] ?? false;
};

export const runTask = async (
  task: Task,
  newCpu: number,
  newMemory: number,
) => {
  const parameters = await getRunParameters(task['taskArn'] as string);
  if (!parameters['overrides']) {
    parameters['overrides'] = {};
  }
  parameters['overrides']['cpu'] = newCpu.toString();
  parameters['overrides']['memory'] = newMemory.toString();
  const client = new ECSClient({});
  const command = new RunTaskCommand(parameters);
  const response = await client.send(command);
  if (!response['tasks']) {
    console.error(response);
    throw new Error('Failed to start task(s)');
  }
  for (const taskResponse of response['tasks']) {
    console.log('started task ' + taskResponse['taskArn']);
  }
  await deleteItem(task['taskArn'] as string);
};

export const getRunParameters = async (
  taskArn: string,
): Promise<RunTaskCommandInput> => {
  const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const command = new GetCommand({
    TableName: process.env.DYNAMODB_TABLE as string,
    Key: {
      taskArn: taskArn,
    },
  });
  const response = await docClient.send(command);
  if (!response.Item) {
    throw new Error('No parameters found for task ' + taskArn);
  }
  return response.Item as RunTaskCommandInput;
};

const deleteItem = async (taskArn: string) => {
  const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const command = new DeleteCommand({
    TableName: process.env.DYNAMODB_TABLE as string,
    Key: {
      taskArn: taskArn,
    },
  });
  await docClient.send(command);
};
