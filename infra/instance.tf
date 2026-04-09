resource "aws_security_group" "server_sg" {
  name   = "${var.app_name}_server_sg"
  vpc_id = aws_vpc.main.id

  tags = {
    app = var.app_name
  }

  ingress {
    security_groups = [aws_security_group.lb_sg.id]
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    description     = "Allow app traffic from ALB"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
}

resource "aws_launch_template" "main" {
  name = "${var.app_name}_launch_template"

  block_device_mappings {
    device_name = "/dev/sdf"

    ebs {
      volume_size = 15
    }
  }

  iam_instance_profile {
    arn = "arn:aws:iam::613232991568:instance-profile/dog-up-ya-app-server"
  }

  image_id = data.aws_ami.amazon_linux.id

  instance_initiated_shutdown_behavior = "terminate"

  instance_market_options {
    market_type = "spot"
  }

  instance_type = "t3.nano"

  metadata_options {
  }

  monitoring {
    enabled = true
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups = [aws_security_group.server_sg.id]
  }

  placement {
  }

  tag_specifications {
    resource_type = "instance"

    tags = {
      app = var.app_name
    }
  }

  user_data = filebase64("${path.module}/scripts/app-server-user-data.sh")
}
