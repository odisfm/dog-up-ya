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

variable "blue_desired_capacity" {
  type    = number
  default = 0
}
variable "green_desired_capacity" {
  type    = number
  default = 0
}

variable "cloudflare_zone_id" {
  type = string
}

variable "server_instance_type" {
  type = string
  default = "t3.nano"
}

variable "watcher_instance_type" {
  type = string
  default = "t3.nano"
}

variable "server_group_max_size" {
  type = number
}
