export interface CloudTrailEvent {
  eventVersion: string;
  userIdentity: UserIdentity;
  eventTime: string;
  eventSource: string;
  eventName: string;
  awsRegion: string;
  sourceIPAddress: string;
  userAgent: string;
  requestParameters: RequestParameters;
  responseElements: ResponseElements;
  requestID: string;
  eventID: string;
  eventType: string;
  apiVersion: string;
  recipientAccountId: string;
}

interface UserIdentity {
  type: string;
  principalId: string;
  arn: string;
  accountId: string;
  accessKeyId: string;
  sessionContext: SessionContext;
}

interface SessionContext {
  attributes: Attributes;
}

interface Attributes {
  mfaAuthenticated: string;
  creationDate: string;
}

interface RequestParameters {
  description: string;
  name: string;
  state: string;
  eventPattern: string;
  scheduleExpression: string;
}

interface ResponseElements {
  ruleArn: string;
}
