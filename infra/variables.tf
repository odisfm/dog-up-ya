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