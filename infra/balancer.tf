resource "aws_security_group" "lb_sg" {
  name   = "${var.app_name}_alb_sg"
  vpc_id = aws_vpc.main.id

  tags = {
    app = var.app_name
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
  }

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
  }
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
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.api.certificate_arn

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
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path    = "/"
    matcher = "200"
  }
}

resource "aws_lb_target_group" "green" {
  name     = "lb-tg-${var.app_name}-green"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path    = "/"
    matcher = "200"
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
  desired_capacity   = var.blue_desired_capacity
  max_size           = 3
  min_size           = 0
  health_check_grace_period = 120

  launch_template {
    id      = aws_launch_template.main.id
    version = "$Latest"
  }
}

resource "aws_autoscaling_group" "green" {
  vpc_zone_identifier = [aws_subnet.a.id, aws_subnet.b.id]
  desired_capacity   = var.green_desired_capacity
  max_size           = 3
  min_size           = 0
  health_check_grace_period = 120

  launch_template {
    id      = aws_launch_template.main.id
    version = "$Latest"
  }
}