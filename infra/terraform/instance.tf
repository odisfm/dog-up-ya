resource "aws_security_group" "server_sg" {
  name   = "${var.app_name}_server_sg"
  vpc_id = aws_vpc.main.id

  tags = {
    app = var.app_name
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
}

resource "aws_instance" "watch_server" {
  ami = data.aws_ami.amazon_linux.id
  associate_public_ip_address = true
  instance_type = var.watcher_instance_type

  iam_instance_profile = "dog-up-ya-app-server"

  security_groups = [aws_security_group.server_sg.id]

  instance_initiated_shutdown_behavior = "terminate"

  monitoring = true

  subnet_id = aws_subnet.a.id

  user_data = filebase64("${path.module}/scripts/app-watcher-user-data.sh")

  tags = {
    app = var.app_name
    Name = "${var.app_name}-watch-server-${formatdate("MMDD-hhmm", timestamp())}"
  }
}
