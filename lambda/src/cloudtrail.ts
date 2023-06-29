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
  sessionIssuer: SessionIssuer;
  webIdFederationData: WebIdFederationData;
  attributes: Attributes;
}

interface SessionIssuer {}

interface WebIdFederationData {}

interface Attributes {
  creationDate: string;
  mfaAuthenticated: string;
}

interface RequestParameters {
  platformVersion: string;
  count: number;
  launchType: string;
  networkConfiguration: NetworkConfiguration;
  cluster: string;
  enableExecuteCommand: boolean;
  taskDefinition: string;
  enableECSManagedTags: boolean;
}

interface NetworkConfiguration {
  awsvpcConfiguration: AwsvpcConfiguration;
}

interface AwsvpcConfiguration {
  assignPublicIp: string;
  securityGroups: string[];
  subnets: string[];
}

interface ResponseElements {
  failures: any[];
  tasks: Task[];
}

interface Task {
  createdAt: string;
  memory: string;
  version: number;
  ephemeralStorage: EphemeralStorage;
  desiredStatus: string;
  lastStatus: string;
  platformFamily: string;
  taskArn: string;
  taskDefinitionArn: string;
  attachments: Attachment[];
  clusterArn: string;
  availabilityZone: string;
  overrides: Overrides;
  enableExecuteCommand: boolean;
  group: string;
  containers: Container[];
  cpu: string;
  tags: Tag[];
  launchType: string;
  attributes: Attribute[];
  platformVersion: string;
}

interface EphemeralStorage {
  sizeInGiB: number;
}

interface Attachment {
  status: string;
  type: string;
  details: Detail[];
  id: string;
}

interface Detail {
  name: string;
  value: string;
}

interface Overrides {
  containerOverrides: ContainerOverride[];
  inferenceAcceleratorOverrides: any[];
}

interface ContainerOverride {
  name: string;
}

interface Container {
  networkInterfaces: any[];
  taskArn: string;
  containerArn: string;
  image: string;
  cpu: string;
  name: string;
  lastStatus: string;
}

interface Tag {
  key: string;
  value: string;
}

interface Attribute {
  value: string;
  name: string;
}

interface TlsDetails {
  tlsVersion: string;
  cipherSuite: string;
  clientProvidedHostHeader: string;
}
