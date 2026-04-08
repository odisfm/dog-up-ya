variable "app_name" {
  type = string
}

variable "active_deployment_target" {
  type        = string
  description = "Deployment target group"

  validation {
    condition     = contains(["blue", "green"], var.active_deployment_target)
    error_message = "target_group must be either 'blue' or 'green'."
  }
}

variable "aws_access_key" {
  description = "AWS IAM access key"
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS IAM secret key"
  sensitive   = true
}

variable "aws_region" {
  description = "AWS region"
  default     = "ap-southeast-4"
}

variable "terraform_state_bucket_name" {
  type = string
  description = "Terraform state bucket"
}
