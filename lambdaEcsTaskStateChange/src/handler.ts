import { EventBridgeEvent } from 'aws-lambda';
import { getRunParameters, getTaskDetails, runTask } from './ecs';
import { determineNewCpuMemory } from './memory';
import { Task } from '@aws-sdk/client-ecs';

export const handler = async (
  event: EventBridgeEvent<'ECS Task State Change', Task>,
) => {
  const taskDetails = await getTaskDetails(event);
  if (!taskDetails) {
    console.log(
      event['detail']['taskArn'] + ' could not be found via the ECS API',
    );
    return false;
  }
  const runParameters = await getRunParameters(
    taskDetails['taskArn'] as string,
  );
  if (!runParameters) {
    console.log(
      event['detail']['taskArn'] +
        ' could not find the runParameters in DynamoDB',
    );
    return false;
  }
  const newCpuMemory = determineNewCpuMemory(taskDetails);
  if (!newCpuMemory) {
    console.log(
      event['detail']['taskArn'] + ' new memory could not be decided',
    );
    return false;
  }
  if (newCpuMemory['memory'] > parseInt(process.env.MAXMEMORY as string)) {
    console.log(
      event['detail']['taskArn'] +
        ' new memory limit of ' +
        newCpuMemory['memory'] +
        ' would exceed max set of ' +
        process.env.MAXMEMORY,
    );
    return false;
  }
  try {
    await runTask(taskDetails, newCpuMemory['cpu'], newCpuMemory['memory']);
  } catch (error) {
    console.log('Could not start task: ' + (error as Error).message);
    return false;
  }

  console.log('tasks have been started');
};
