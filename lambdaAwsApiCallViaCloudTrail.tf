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
}

data "archive_file" "lambda_ct" {
  type        = "zip"
  source_dir  = "${path.module}/lambdaAwsApiCallViaCloudTrail/build"
  output_path = "lambda_ct.zip"
}

resource "aws_lambda_function" "test_lambda" {
  filename         = "lambda_ct.zip"
  function_name    = "${var.prefix}-lambdaAwsApiCallViaCloudTrail"
  description      = "Catches RunTask commands from CloudTrail and stores them in DynamoDB"
  role             = aws_iam_role.lambda_ct.arn
  handler          = "handler.handler"
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.lambda_ct.output_base64sha256

}