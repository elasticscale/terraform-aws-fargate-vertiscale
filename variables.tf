variable "prefix" {
  type        = string
  description = "Value to prefix all resources with"
  default     = "fargateAutoscale"
}

variable "region" {
  type        = string
  description = "AWS region to deploy to"
  // todo, delete default
  default = "eu-west-1"
}

variable "task_expires" {
  type        = number
  description = "Purge tasks from DynamoDB after this many seconds (default 7 days)"
  default     = 604800
}

variable "tagName" {
  type        = string
  description = "The tag name attached to RunTask command that triggers this module to run"
  default     = "fargateAutoscale"
}