import { RunTaskCommandInput, RunTaskCommandOutput } from '@aws-sdk/client-ecs';

export interface CloudTrailRunTaskEvent {
  eventVersion: string;
  userIdentity: UserIdentity;
  eventTime: string;
  eventSource: string;
  eventName: string;
  awsRegion: string;
  sourceIPAddress: string;
  userAgent: string;
  requestParameters: RunTaskCommandInput;
  responseElements: RunTaskCommandOutput;
  requestID: string;
  eventID: string;
  readOnly: boolean;
  eventType: string;
  managementEvent: boolean;
  recipientAccountId: string;
  eventCategory: string;
  tlsDetails: TlsDetails;
  sessionCredentialFromConsole: string;
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
  creationDate: string;
  mfaAuthenticated: string;
}

interface TlsDetails {
  tlsVersion: string;
  cipherSuite: string;
  clientProvidedHostHeader: string;
}
