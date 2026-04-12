variable "app_name" {
  type = string
}

variable "cloudflare_zone_id" {
  type = string
}

variable "watcher_instance_type" {
  type = string
  default = "t3.nano"
}
