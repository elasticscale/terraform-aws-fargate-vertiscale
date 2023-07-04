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
    console.log(JSON.stringify(event))
};
