variable "prefix" {
  type        = string
  description = "Value to prefix all resources with"
  default     = "fargateAutoscale"
}
variable "tagName" {
  type        = string
  description = "The tag name attached to RunTask command that triggers this module to run"
  default     = "fargateAutoscale"
}
variable "maxMemory" {
  type        = number
  description = "The maximum amount of memory to allow a task to use in MB"
  default     = 122880
}
variable "iamPassRoles" {
  type        = list(string)
  description = "The possible IAM roles for your task definitions, this is used in the IAM policy to allow the lambda to start the tasks, using * is a bad practice here"
  default     = ["*"]
}
variable "region" {
  type        = string
  description = "AWS region to deploy to"
}
variable "task_expires" {
  type        = number
  description = "Purge tasks from DynamoDB after this many seconds (default 7 days)"
  default     = 604800
}
variable "setupCloudTrail" {
  type        = bool
  description = "Setup CloudTrail to capture ECS events, if you already have a trail setup to an S3 bucket you can set this to false. Without CloudTrail the module will not work"
  default     = true
}