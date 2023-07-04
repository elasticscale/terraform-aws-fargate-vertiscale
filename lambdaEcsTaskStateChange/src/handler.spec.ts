import { handler } from './handler';
import fs from 'fs';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('handler', () => {
  beforeEach(() => {
    ddbMock.reset();
  });
  test('can insert workingExample to dynamodb', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    ddbMock.on(PutCommand).resolves({
      Attributes: {},
    });
    const data = JSON.parse(
      fs.readFileSync('./examples/workingExample.json', 'utf8'),
    );
    await handler(data);
    expect(ddbMock.calls()).toHaveLength(1);
    expect(log).toHaveBeenCalledWith('Logged the following tasks:', [
      'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118ac',
    ]);
  });
  test('can insert multipleTasks to dynamodb', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    ddbMock.on(PutCommand).resolves({
      Attributes: {},
    });
    const data = JSON.parse(
      fs.readFileSync('./examples/multipleTasks.json', 'utf8'),
    );
    await handler(data);
    expect(ddbMock.calls()).toHaveLength(2);
    expect(log).toHaveBeenCalledWith('Logged the following tasks:', [
      'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118ac',
      'arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118a1',
    ]);
  });
  test('catches dynamodb errors properly', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    ddbMock.on(PutCommand).rejects(new Error('Some random error occurred'));
    const data = JSON.parse(
      fs.readFileSync('./examples/workingExample.json', 'utf8'),
    );
    await handler(data);
    expect(ddbMock.calls()).toHaveLength(1);
    expect(error).toHaveBeenCalledWith(
      'Task arn:aws:ecs:eu-west-1:564033685323:task/prowler-scanner-cluster/13716fc088014c979ea8e353ae0118ac could not be saved in dynamodb: Some random error occurred',
    );
  });
  test('catches the error if there are no tasks started', async () => {
    const data = JSON.parse(
      fs.readFileSync('./examples/noTasksExample.json', 'utf8'),
    );
    await expect(handler(data)).rejects.toThrowError(
      'No tasks found in responseElements',
    );
  });
});
