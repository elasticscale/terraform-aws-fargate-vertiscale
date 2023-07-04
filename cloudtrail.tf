locals {
  bucket_name = "${lower(var.prefix)}-task-trail-${random_string.random.result}"
}

resource "random_string" "random" {
  length  = 8
  special = false
  upper   = false
}

// trail needs to exist for the API call to be logged in Eventbridge
resource "aws_cloudtrail" "cf_task_trail" {
  count                         = var.setupCloudTrail ? 1 : 0
  depends_on                    = [module.s3_bucket]
  name                          = "${var.prefix}-task-trail"
  s3_bucket_name                = local.bucket_name
  include_global_service_events = false
  advanced_event_selector {
    name = "Log required to trigger Fargate Autoscales"
    field_selector {
      field  = "eventCategory"
      equals = ["Management"]
    }
  }
}

module "s3_bucket" {
  count         = var.setupCloudTrail ? 1 : 0
  source        = "cloudposse/cloudtrail-s3-bucket/aws"
  version       = "0.26.2"
  name          = local.bucket_name
  force_destroy = true
}