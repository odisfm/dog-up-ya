output "blue_asg_name" {
  value = aws_autoscaling_group.blue.name
}
output "green_asg_name" {
  value = aws_autoscaling_group.green.name
}
output "lb_dns_name" {
  value = aws_lb.main.dns_name
}

output "blue_target_group_arn" {
  value = aws_lb_target_group.blue.arn
}

output "green_target_group_arn" {
  value = aws_lb_target_group.green.arn
}

output "active_deployment_target" {
  value = var.active_deployment_target
}