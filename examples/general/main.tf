module "scale" {
  source = "../../"
  // normally you would set the possible IAM roles of your autoscaling tasks here
  iam_pass_roles = ["*"]
  prefix = "fargatescale"
  tag_name = "fargatescale"
  max_memory = 32768
  task_expires = 86400
  // if you already have a cloudtrail enabled to s3, you can set this to false
  setup_cloud_trail = true
}