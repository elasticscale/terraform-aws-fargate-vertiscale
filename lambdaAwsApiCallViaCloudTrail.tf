data "aws_iam_policy_document" "lambda_ct" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_ct" {
  name               = "${var.prefix}-lambdaAwsApiCallViaCloudTrailRole"
  assume_role_policy = data.aws_iam_policy_document.lambda_ct.json
  inline_policy {
    name = "${var.prefix}-lambdaAwsApiCallViaCloudTrailPolicy"
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

data "archive_file" "lambda_ct" {
  type        = "zip"
  source_dir  = "${path.module}/lambdaAwsApiCallViaCloudTrail/build"
  output_path = "lambda_ct.zip"
}
resource "aws_cloudwatch_event_rule" "ct_event_rule" {
  name        = "${var.prefix}-cloudTrailRule"
  description = "Captures RunTask commands from CloudTrail with the correct tags"
  event_pattern = jsonencode({
    source = [
      "aws.ecs"
    ]
    detail-type = [
      "AWS API Call via CloudTrail"
    ],
    detail = {
      eventSource = [
        "ecs.amazonaws.com"
      ],
      eventName = [
        "RunTask"
      ],
      requestParameters = {
        tags = {
          key = [var.tagName]
        }
      }

    }
  })
}

resource "aws_cloudwatch_event_target" "ct_event_target" {
  target_id = "${var.prefix}-lambdaAwsApiCallViaCloudTrail"
  rule      = aws_cloudwatch_event_rule.ct_event_rule.name
  arn       = aws_lambda_function.lambda_ct.arn
}
resource "aws_lambda_function" "lambda_ct" {
  filename         = "lambda_ct.zip"
  function_name    = "${var.prefix}-lambdaAwsApiCallViaCloudTrail"
  description      = "Catches RunTask commands from CloudTrail and stores them in DynamoDB"
  role             = aws_iam_role.lambda_ct.arn
  handler          = "handler.handler"
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.lambda_ct.output_base64sha256
  environment {
    variables = {
      TTL_EXPIRES    = var.task_expires
      DYNAMODB_TABLE = "${var.prefix}-tasks"
    }
  }
}

resource "aws_lambda_permission" "lambda_ct_resource_policy" {
  statement_id  = "${var.prefix}-allowEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_ct.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ct_event_rule.arn
}

