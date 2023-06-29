import {
  ECSClient,
  DescribeTasksCommand,
  RunTaskCommand,
  Task,
} from '@aws-sdk/client-ecs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

import { CloudTrailEvent } from './cloudtrail';

import { Handler, EventBridgeEvent } from 'aws-lambda';

const fargateConfigurations = {
  Windows: {
    1024: {
      memoryStart: 2048,
      memoryEnd: 8192,
      memoryStep: 1024,
    },
    2048: {
      memoryStart: 4096,
      memoryEnd: 16384,
      memoryStep: 1024,
    },
    4096: {
      memoryStart: 8192,
      memoryEnd: 30720,
      memoryStep: 1024,
    },
  },
  Linux: {
    // we can get away with ommitting the 512 mb as when this invokes would already be double
    256: {
      memoryStart: 1024,
      memoryEnd: 2048,
      memoryStep: 1024,
    },
    512: {
      memoryStart: 1024,
      memoryEnd: 4096,
      memoryStep: 1024,
    },
    1024: {
      memoryStart: 2048,
      memoryEnd: 8192,
      memoryStep: 1024,
    },
    2048: {
      memoryStart: 4096,
      memoryEnd: 16384,
      memoryStep: 1024,
    },
    4096: {
      memoryStart: 8192,
      memoryEnd: 30720,
      memoryStep: 1024,
    },
    8192: {
      memoryStart: 16384,
      memoryEnd: 61440,
      memoryStep: 4096,
    },
    16384: {
      memoryStart: 32768,
      memoryEnd: 122880,
      memoryStep: 8192,
    },
  },
};

type EcsTaskChangeEvent = EventBridgeEvent<'ECS Task State Change', Task>;
type AwsApiCallViaCloudTrailEvent = EventBridgeEvent<
  'AWS API Call via CloudTrail',
  CloudTrailEvent
>;

export const handler: Handler = async (
  event: EcsTaskChangeEvent | AwsApiCallViaCloudTrailEvent,
) => {
  if (event['detail-type'] == 'AWS API Call via CloudTrail') {
    // this is a request to run a task
    return await extractRequestParameters(event);
  }
  if (event['detail-type'] == 'ECS Task State Change') {
    // this is a task change event
    return await handleTaskStateChange(event);
  }
  throw new Error('Invalid event type');
};

const handleTaskStateChange = async (event: EcsTaskChangeEvent) => {
  if (
    event['detail']['group'] &&
    event['detail']['group'].startsWith('service')
  ) {
    return event['detail']['taskArn'] + ' was ran through a service';
  }
  if (!hasMemoryIssues(event)) {
    return event['detail']['taskArn'] + ' did not have any memory issues';
  }
  const taskDetails = await getTaskDetails(event);
  const runParameters = await getRunParameters(taskDetails['taskArn']);
  if (!runParameters) {
    return (
      event['detail']['taskArn'] +
      ' did not have the autoscaleMemory tag attached when it launched'
    );
  }
  if (!taskDetails) {
    return event['detail']['taskArn'] + ' could not be found via the ECS API';
  }
  const newCpuMemory = determineNewCpuMemory(taskDetails);
  if (!newCpuMemory) {
    return event['detail']['taskArn'] + ' new memory could not be decided';
  }
  if (
    process.env.MAXMEMORY &&
    newCpuMemory['memory'] > parseInt(process.env.MAXMEMORY)
  ) {
    return (
      event['detail']['taskArn'] +
      ' new memory limit of ' +
      newCpuMemory['memory'] +
      ' would exceed max set of ' +
      process.env.MAXMEMORY
    );
  }
  await runTask(taskDetails, newCpuMemory['cpu'], newCpuMemory['memory']);
};

const extractRequestParameters = async (
  event: AwsApiCallViaCloudTrailEvent,
) => {
  const tasks = [];
  for (const task of event['detail']['responseElements']['tasks']) {
    if (hasAutoscaleTag(event['detail']['requestParameters'])) {
      try {
        await storeInvocationDetails(
          task['taskArn'],
          event['detail']['requestParameters'],
        );
        tasks.push(task['taskArn']);
      } catch (error) {
        console.error(
          'task ' +
            task['taskArn'] +
            ' could not be saved in dynamodb: ' +
            error.message,
        );
      }
    }
  }
  return 'these tasks saved in dynamodb: ' + tasks.join(', ');
};

const storeInvocationDetails = async (
  taskArn: string,
  data: CloudTrailEvent['requestParameters'],
) => {
  const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const input = {
    TableName: 'fargateAutoScale',
    Item: {
      taskArn: taskArn,
      ...data,
    },
  };
  const command = new PutCommand(input);
  await docClient.send(command);
};

const hasAutoscaleTag = (hasTags) => {
  for (const tag of hasTags['tags']) {
    if (tag['name'] == 'autoscaleMemory ') {
      return true;
    }
  }
  return false;
};

const hasMemoryIssues = (event) => {
  for (const container of event['detail']['containers']) {
    if (
      container['reason'] &&
      container['reason'].startsWith('OutOfMemoryError')
    ) {
      return true;
    }
  }
  return false;
};

const getTaskDetails = async (event) => {
  const client = new ECSClient();
  const input = {
    // DescribeTasksRequest
    cluster: event['detail']['clusterArn'],
    tasks: [event['detail']['taskArn']],
  };
  const command = new DescribeTasksCommand(input);
  const data = await client.send(command);
  return data['tasks'][0] ?? false;
};

// todo refactor code so its easier to test
const determineNewCpuMemory = (task) => {
  if (!fargateConfigurations[task['platformFamily']]) {
    throw new Error(
      'Task family ' +
        task['platformFamily'] +
        ' was not defined in the capacity settings',
    );
  }
  const capacity = fargateConfigurations[task['platformFamily']];
  const newMemory = parseInt(task['memory']) * 2;
  let currentCpuSetting = findCapacitySetting(
    capacity,
    parseInt(task['cpu']),
    newMemory,
  );
  if (!currentCpuSetting) {
    // check if we can get to the right setting if we double the cpu
    for (
      let cpu = task['cpu'];
      cpu <= 16384 || currentCpuSetting;
      cpu = cpu * 2
    ) {
      currentCpuSetting = findCapacitySetting(capacity, cpu, newMemory);
    }
  }
  return currentCpuSetting;
};

// todo, write tests, this probably is too straightforward, we might need to the min distance so we can also round up a bit, it does not need to be a full match
// for instance, 3 => 6 => 12 => 24
const findCapacitySetting = (capacity, cpu, memory) => {
  if (!capacity[cpu]) {
    // cpu not available in the mapping
    return false;
  }
  if (
    memory < capacity[cpu]['memoryStart'] ||
    memory > capacity[cpu]['memoryEnd']
  ) {
    // memory is out of range anyway
    return false;
  }
  const memoryOptions = [];
  for (
    let limit = capacity[cpu]['memoryStart'];
    capacity[cpu]['memoryEnd'] >= limit;
    limit += capacity[cpu]['memoryStep']
  ) {
    memoryOptions.push(limit);
  }
  if (memoryOptions.includes(memory)) {
    return {
      cpu: cpu,
      memory: memory,
    };
  }
  return false;
};

const getRunParameters = async (taskArn) => {
  const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const command = new GetCommand({
    TableName: 'fargateAutoScale',
    Key: {
      taskArn: taskArn,
    },
  });
  const response = await docClient.send(command);
  return response.Item;
};

const deleteItem = async (taskArn) => {
  const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const command = new DeleteCommand({
    TableName: 'fargateAutoScale',
    Key: {
      taskArn: taskArn,
    },
  });
  const response = await docClient.send(command);
  return response.Item;
};

const runTask = async (task, newCpu, newMemory) => {
  let parameters = await getRunParameters(task['taskArn']);
  if (!parameters['overrides']) {
    parameters['overrides'] = {};
  }
  parameters['overrides']['cpu'] = newCpu.toString();
  parameters['overrides']['memory'] = newMemory.toString();
  // start the task
  const client = new ECSClient({});
  const command = new RunTaskCommand(parameters);
  const response = await client.send(command);
  for (const taskResponse of response['tasks']) {
    console.log('started task ' + taskResponse['taskArn']);
  }
  await deleteItem(task['taskArn']);
};
