resource "aws_security_group" "server_sg" {
  name   = "${var.app_name}_server_sg"
  vpc_id = aws_vpc.main.id

  tags = {
    app = var.app_name
  }
}

resource "aws_vpc_security_group_egress_rule" "server_allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.server_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}

resource "aws_vpc_security_group_ingress_rule" "server_allow_http_ipv4" {
  security_group_id = aws_security_group.server_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "server_allow_tls_ipv4" {
  security_group_id = aws_security_group.server_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  ip_protocol       = "tcp"
  to_port           = 443
}

resource "aws_launch_template" "main" {
  name = "${var.app_name}_launch_template"

  block_device_mappings {
    device_name = "/dev/sdf"

    ebs {
      volume_size = 15
    }
  }

  image_id = data.aws_ami.ubuntu.id

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
    associate_public_ip_address = false
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

  user_data = base64encode(<<-EOF
      #!/bin/bash
      TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
        -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
      INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
        http://169.254.169.254/latest/meta-data/instance-id)
      echo $INSTANCE_ID > index.html
      python3 -m http.server 80 &
      EOF
  )
}
