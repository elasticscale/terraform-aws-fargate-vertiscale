import { EventBridgeEvent } from 'aws-lambda';
import { getRunParameters, getTaskDetails, runTask } from './ecs';
import { determineNewCpuMemory } from './memory';
import { Task } from '@aws-sdk/client-ecs';

export const handler = async (
  event: EventBridgeEvent<'ECS Task State Change', Task>,
) => {
  console.log(JSON.stringify(event));
  const taskDetails = await getTaskDetails(event);
  if (!taskDetails) {
    return event['detail']['taskArn'] + ' could not be found via the ECS API';
  }
  const runParameters = await getRunParameters(
    taskDetails['taskArn'] as string,
  );
  if (!runParameters) {
    return (
      event['detail']['taskArn'] +
      ' could not find the runParameters in DynamoDB'
    );
  }
  console.log(taskDetails);
  const newCpuMemory = determineNewCpuMemory(taskDetails);
  if (!newCpuMemory) {
    return event['detail']['taskArn'] + ' new memory could not be decided';
  }
  if (newCpuMemory['memory'] > parseInt(process.env.MAXMEMORY as string)) {
    return (
      event['detail']['taskArn'] +
      ' new memory limit of ' +
      newCpuMemory['memory'] +
      ' would exceed max set of ' +
      process.env.MAXMEMORY
    );
  }
  await runTask(taskDetails, newCpuMemory['cpu'], newCpuMemory['memory']);
  return 'tasks have been started';
};
