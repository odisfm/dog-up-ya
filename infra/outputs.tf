output "blue_asg_name" {
  value = aws_autoscaling_group.blue.name
}
output "green_asg_name" {
  value = aws_autoscaling_group.green.name
}
output "lb_dns_name" {
  value = aws_lb.main.dns_name
}

output "active_deployment_target" {
  value = var.active_deployment_target
}