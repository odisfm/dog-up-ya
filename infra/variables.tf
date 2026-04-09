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

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}
