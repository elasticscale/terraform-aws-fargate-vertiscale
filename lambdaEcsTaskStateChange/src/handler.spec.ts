import { handler } from './handler';
import fs from 'fs';
import { getTaskDetails, getRunParameters, runTask } from './ecs';
import { determineNewCpuMemory } from './memory';

jest.mock('./ecs');
jest.mock('./memory');

describe('handler', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('can double memory of ecsTaskStoppedOom', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(jest.fn());
    // @ts-expect-error mock implementation
    determineNewCpuMemory.mockImplementation(() => ({
      cpu: 1024,
      memory: 4096,
    }));
    // @ts-expect-error mock implementation
    getTaskDetails.mockImplementation(() => ({
      taskArn:
        'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118ac',
      platformFamily: 'Linux',
      cpu: 1024,
      memory: 2048,
    }));
    // @ts-expect-error mock implementation
    getRunParameters.mockImplementation(() => ({
      Item: {
        taskArn:
          'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118ac',
        launchType: 'FARGATE',
        platformFamily: 'LINUX',
      },
    }));
    // @ts-expect-error mock implementation
    runTask.mockImplementation(() => true);
    const data = JSON.parse(
      fs.readFileSync('./examples/ecsTaskStoppedOom.json', 'utf8'),
    );
    await handler(data);
    expect(log).toHaveBeenCalledWith('tasks have been started');
  });
  test('gives an error if the task cant be found', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(jest.fn());
    // @ts-expect-error mock implementation
    getTaskDetails.mockImplementation(() => false);
    const data = JSON.parse(
      fs.readFileSync('./examples/ecsTaskStoppedOom.json', 'utf8'),
    );
    await handler(data);
    expect(log).toHaveBeenCalledWith(
      'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/43a4cd8b90884d4c8daf1f1e1970b71c could not be found via the ECS API',
    );
  });
  test('gives an error if the task cant be found in dynamodb', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(jest.fn());
    // @ts-expect-error mock implementation
    getTaskDetails.mockImplementation(() => ({
      taskArn:
        'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118ac',
      platformFamily: 'Linux',
      cpu: 1024,
      memory: 2048,
    }));
    // @ts-expect-error mock implementation
    getRunParameters.mockImplementation(() => false);
    const data = JSON.parse(
      fs.readFileSync('./examples/ecsTaskStoppedOom.json', 'utf8'),
    );
    await handler(data);
    expect(log).toHaveBeenCalledWith(
      'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/43a4cd8b90884d4c8daf1f1e1970b71c could not find the runParameters in DynamoDB',
    );
  });
  test('gives an error if it cant decide the memory', async () => {
    const log = jest.spyOn(console, 'log');
    // @ts-expect-error mock implementation
    determineNewCpuMemory.mockImplementation(() => false);
    // @ts-expect-error mock implementation
    getTaskDetails.mockImplementation(() => ({
      taskArn:
        'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118ac',
      platformFamily: 'Linux',
      cpu: 2048,
      memory: 4096,
    }));
    // @ts-expect-error mock implementation
    getRunParameters.mockImplementation(() => ({
      Item: {
        taskArn:
          'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118ac',
        launchType: 'FARGATE',
        platformFamily: 'LINUX',
      },
    }));
    // @ts-expect-error mock implementation
    runTask.mockImplementation(() => true);
    const data = JSON.parse(
      fs.readFileSync('./examples/ecsTaskStoppedOom.json', 'utf8'),
    );
    await handler(data);
    expect(log).toHaveBeenCalledWith(
      'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/43a4cd8b90884d4c8daf1f1e1970b71c new memory could not be decided',
    );
  });
  test('gives an error on low memory setting', async () => {
    const log = jest.spyOn(console, 'log');
    // @ts-expect-error mock implementation
    determineNewCpuMemory.mockImplementation(() => ({
      cpu: 1024,
      memory: 8192,
    }));
    // @ts-expect-error mock implementation
    getTaskDetails.mockImplementation(() => ({
      taskArn:
        'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118ac',
      platformFamily: 'Linux',
      cpu: 2048,
      memory: 4096,
    }));
    // @ts-expect-error mock implementation
    getRunParameters.mockImplementation(() => ({
      Item: {
        taskArn:
          'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118ac',
        launchType: 'FARGATE',
        platformFamily: 'LINUX',
      },
    }));
    // @ts-expect-error mock implementation
    runTask.mockImplementation(() => true);
    const data = JSON.parse(
      fs.readFileSync('./examples/ecsTaskStoppedOom.json', 'utf8'),
    );
    await handler(data);
    expect(log).toHaveBeenCalledWith(
      'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/43a4cd8b90884d4c8daf1f1e1970b71c new memory limit of 8192 would exceed max set of 4096',
    );
  });
  test('catches error of runTask', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(jest.fn());
    // @ts-expect-error mock implementation
    determineNewCpuMemory.mockImplementation(() => ({
      cpu: 1024,
      memory: 4096,
    }));
    // @ts-expect-error mock implementation
    getTaskDetails.mockImplementation(() => ({
      taskArn:
        'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118ac',
      platformFamily: 'Linux',
      cpu: 1024,
      memory: 2048,
    }));
    // @ts-expect-error mock implementation
    getRunParameters.mockImplementation(() => ({
      Item: {
        taskArn:
          'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118ac',
        launchType: 'FARGATE',
        platformFamily: 'LINUX',
      },
    }));
    // @ts-expect-error mock implementation
    runTask.mockImplementation(() => {
      throw new Error('Wtf?');
    });
    const data = JSON.parse(
      fs.readFileSync('./examples/ecsTaskStoppedOom.json', 'utf8'),
    );
    await handler(data);
    expect(log).toHaveBeenCalledWith('Could not start task: Wtf?');
  });
});
