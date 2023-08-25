<!-- BEGIN_TF_DOCS -->

## Description

This module automatically vertically scales AWS Fargate tasks when they run out memory due to an OOM Exception. It uses two Lambda functions to monitor for RunTask commands and for ECS stopped tasks. When it encounteres an OOM error it will restart the tasks automatically with double the memory.

Your tasks have to be idempotent for this to work!

For more debugging steps check out [the elasticscale blog](https://elasticscale.cloud/en/automatically-scaling-aws-fargate-tasks-vertically/).

## About ElasticScale

ElasticScale is a Solutions Architecture as a Service focusing on start-ups and scale-ups. For a fixed monthly subscription fee, we handle all your AWS workloads. Some services include:

* Migrating **existing workloads** to AWS
* Implementing the **Zero Trust security model**
* Integrating **DevOps principles** within your organization
* Moving to **infrastructure automation** (Terraform)
* Complying with **ISO27001 regulations within AWS**

You can **pause** the subscription at any time and have **direct access** to certified AWS professionals.

Check out our <a href="https://elasticscale.cloud" target="_blank" style="color: #14dcc0; text-decoration: underline">website</a> for more information.

<img src="https://elasticscale-public.s3.eu-west-1.amazonaws.com/logo/Logo_ElasticScale_4kant-transparant.png" alt="ElasticScale logo" width="150"/>

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | 5.6.2 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_archive"></a> [archive](#provider\_archive) | 2.4.0 |
| <a name="provider_aws"></a> [aws](#provider\_aws) | 5.6.2 |
| <a name="provider_random"></a> [random](#provider\_random) | 3.5.1 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_dynamodb_tasks"></a> [dynamodb\_tasks](#module\_dynamodb\_tasks) | terraform-aws-modules/dynamodb-table/aws | n/a |
| <a name="module_s3_bucket"></a> [s3\_bucket](#module\_s3\_bucket) | cloudposse/cloudtrail-s3-bucket/aws | 0.26.2 |

## Resources

| Name | Type |
|------|------|
| [aws_cloudtrail.cf_task_trail](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/resources/cloudtrail) | resource |
| [aws_cloudwatch_event_rule.ct_event_rule](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/resources/cloudwatch_event_rule) | resource |
| [aws_cloudwatch_event_rule.ecs_event_rule](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/resources/cloudwatch_event_rule) | resource |
| [aws_cloudwatch_event_target.ct_event_target](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/resources/cloudwatch_event_target) | resource |
| [aws_cloudwatch_event_target.ecs_event_target](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/resources/cloudwatch_event_target) | resource |
| [aws_iam_role.lambda_ct](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/resources/iam_role) | resource |
| [aws_iam_role.lambda_ecs](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/resources/iam_role) | resource |
| [aws_lambda_function.lambda_ct](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/resources/lambda_function) | resource |
| [aws_lambda_function.lambda_ecs](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/resources/lambda_function) | resource |
| [aws_lambda_permission.lambda_ct_resource_policy](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/resources/lambda_permission) | resource |
| [aws_lambda_permission.lambda_ecs_resource_policy](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/resources/lambda_permission) | resource |
| [random_string.random](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/string) | resource |
| [archive_file.lambda_ct](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file) | data source |
| [archive_file.lambda_ecs](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file) | data source |
| [aws_iam_policy_document.lambda_ct](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.lambda_ecs](https://registry.terraform.io/providers/hashicorp/aws/5.6.2/docs/data-sources/iam_policy_document) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_iam_pass_roles"></a> [iam\_pass\_roles](#input\_iam\_pass\_roles) | The possible IAM roles for your task definitions, this is used in the IAM policy to allow the lambda to pass the role, using [*] is a bad practice here | `list(string)` | n/a | yes |
| <a name="input_max_memory"></a> [max\_memory](#input\_max\_memory) | The maximum amount of memory to allow a task to use in MB | `number` | `122880` | no |
| <a name="input_prefix"></a> [prefix](#input\_prefix) | Value to prefix all resources with (lowercase) | `string` | `"fargatevertiscale"` | no |
| <a name="input_region"></a> [region](#input\_region) | AWS region to deploy to | `string` | n/a | yes |
| <a name="input_setup_cloud_trail"></a> [setup\_cloud\_trail](#input\_setup\_cloud\_trail) | Setup CloudTrail to capture ECS events, if you already have a trail setup to an S3 bucket you can set this to false. Without CloudTrail the module will not work | `bool` | `true` | no |
| <a name="input_tag_name"></a> [tag\_name](#input\_tag\_name) | The tag name attached to RunTask command that triggers this module to run | `string` | `"fargatevertiscale"` | no |
| <a name="input_task_expires"></a> [task\_expires](#input\_task\_expires) | Purge tasks from DynamoDB after this many seconds (default 7 days) | `number` | `604800` | no |

## Outputs

No outputs.
<!-- END_TF_DOCS -->