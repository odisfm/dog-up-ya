resource "aws_security_group" "lb_sg" {
  name   = "${var.app_name}_alb_sg"
  vpc_id = aws_vpc.main.id

  tags = {
    app = var.app_name
  }
}

resource "aws_vpc_security_group_egress_rule" "lb_allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.lb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}

resource "aws_vpc_security_group_ingress_rule" "lb_allow_http_ipv4" {
  security_group_id = aws_security_group.lb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "lb_allow_tls_ipv4" {
  security_group_id = aws_security_group.lb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  ip_protocol       = "tcp"
  to_port           = 443
}

resource "aws_lb" "main" {
  name               = "test-lb-tf"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb_sg.id]
  subnets            = [aws_subnet.a.id, aws_subnet.b.id]


  tags = {
    environment = "production"
    app         = var.app_name
  }
}

resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "forward"

    forward {
      target_group {
        arn    = aws_lb_target_group.blue.arn
        weight = var.active_deployment_target == "blue" ? 100 : 0
      }
      target_group {
        arn    = aws_lb_target_group.green.arn
        weight = var.active_deployment_target == "green" ? 100 : 0
      }
    }
  }
}

resource "aws_lb_target_group" "blue" {
  name     = "lb-tg-${var.app_name}-blue"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path    = "/index"
    matcher = "200-499"
  }
}

resource "aws_lb_target_group" "green" {
  name     = "lb-tg-${var.app_name}-green"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path    = "/index"
    matcher = "200-499"
  }
}

resource "aws_autoscaling_attachment" "blue" {
  autoscaling_group_name = aws_autoscaling_group.blue.name
  lb_target_group_arn    = aws_lb_target_group.blue.arn
}

resource "aws_autoscaling_attachment" "green" {
  autoscaling_group_name = aws_autoscaling_group.green.name
  lb_target_group_arn    = aws_lb_target_group.green.arn
}

resource "aws_autoscaling_group" "blue" {
  vpc_zone_identifier = [aws_subnet.a.id, aws_subnet.b.id]
  desired_capacity   = 2
  max_size           = 3
  min_size           = 0

  launch_template {
    id      = aws_launch_template.main.id
    version = "$Latest"
  }
}

resource "aws_autoscaling_group" "green" {
  vpc_zone_identifier = [aws_subnet.a.id, aws_subnet.b.id]
  desired_capacity   = 2
  max_size           = 3
  min_size           = 0

  launch_template {
    id      = aws_launch_template.main.id
    version = "$Latest"
  }
}