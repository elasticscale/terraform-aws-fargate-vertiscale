import { EventBridgeEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { CloudTrailRunTaskEvent } from './cloudTrailEvent';
import { RunTaskCommandInput } from '@aws-sdk/client-ecs';

export const handler = async (
  event: EventBridgeEvent<
    'AWS API Call via CloudTrail',
    CloudTrailRunTaskEvent
  >,
) => {
  const tasks = [];
  if (!event['detail']['responseElements']['tasks']) {
    throw new Error('no tasks found in responseElements');
  }
  for (const task of event['detail']['responseElements']['tasks']) {
    try {
      await storeInvocationDetails(
        task['taskArn'] as string,
        event['detail']['requestParameters'],
      );
      tasks.push(task['taskArn']);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `Task ${task['taskArn']} could not be saved in dynamodb: ${errorMessage}`,
      );
    }
  }
  console.log('Logged the following tasks:', tasks);
};

const storeInvocationDetails = async (
  taskArn: string,
  data: RunTaskCommandInput,
) => {
  const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  console.log(process.env)
  const input = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      taskArn: taskArn,
      ...data,
      expires:
        Math.floor(Date.now() / 1000) +
        parseInt(process.env.TTL_EXPIRES as string),
    },
  };
  console.log(input);
  const command = new PutCommand(input);
  await docClient.send(command);
};
