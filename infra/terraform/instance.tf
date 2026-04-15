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
