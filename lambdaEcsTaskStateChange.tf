data "aws_iam_policy_document" "lambda_ecs" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_ecs" {
  name               = "${var.prefix}-lambdaEcsTaskStateChange"
  assume_role_policy = data.aws_iam_policy_document.lambda_ecs.json
  inline_policy {
    name = "${var.prefix}-lambdaEcsTaskStateChange"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action = [
            "dynamodb:PutItem",
            "dynamodb:DeleteItem",
            "dynamodb:GetItem",
            "dynamodb:Scan",
            "dynamodb:Query",
            "dynamodb:UpdateItem"
          ]
          Effect   = "Allow"
          Resource = "${module.dynamodb_tasks.dynamodb_table_arn}"
        }
      ]
    })
  }
}

data "archive_file" "lambda_ecs" {
  type        = "zip"
  source_dir  = "${path.module}/lambdaEcsTaskStateChange/build"
  output_path = "lambda_ecs.zip"
}

resource "aws_cloudwatch_event_rule" "ecs_event_rule" {
  name        = "${var.prefix}-ecsTaskStateChange"
  description = "Captures the stopped ECS tasks and reboots them with more memory if necassery"
  event_pattern = jsonencode({
    source = [
      "aws.ecs"
    ]
    detail-type = [
      "ECS Task State Change"
    ],
    detail = {
      lastStatus = [
        "STOPPED"
      ]
    }
  })
}

resource "aws_cloudwatch_event_target" "ecs_event_target" {
  target_id = "${var.prefix}-lambdaEcsTaskStateChange"
  rule      = aws_cloudwatch_event_rule.ecs_event_rule.name
  arn       = aws_lambda_function.lambda_ecs.arn
}

resource "aws_lambda_function" "lambda_ecs" {
  filename         = "lambda_ecs.zip"
  function_name    = "${var.prefix}-lambdaEcsTaskStateChange"
  description      = "Reboots ECS tasks if they are hitting an OOM"
  role             = aws_iam_role.lambda_ecs.arn
  handler          = "handler.handler"
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.lambda_ecs.output_base64sha256
  environment {
    variables = {
      TTL_EXPIRES    = var.task_expires
      DYNAMODB_TABLE = "${var.prefix}-tasks"
    }
  }
}

resource "aws_lambda_permission" "lambda_ecs_resource_policy" {
  statement_id  = "${var.prefix}-allowEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_ecs.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ecs_event_rule.arn
}

