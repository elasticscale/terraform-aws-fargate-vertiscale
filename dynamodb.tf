module "dynamodb_tasks" {
  source   = "terraform-aws-modules/dynamodb-table/aws"
  name     = "${var.prefix}-tasks"
  hash_key = "taskArn"
  attributes = [
    {
      name = "taskArn"
      type = "S"
    }
  ]
  ttl_attribute_name = "expires"
  ttl_enabled        = true
}