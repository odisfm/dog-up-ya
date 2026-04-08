resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    name = "vpc-${var.app_name}"
    app  = var.app_name
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    name = "igw-${var.app_name}"
    app  = var.app_name
  }
}

resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}

resource "aws_route_table_association" "blue" {
  subnet_id      = aws_subnet.blue.id
  route_table_id = aws_route_table.main.id
}

resource "aws_route_table_association" "green" {
  subnet_id      = aws_subnet.green.id
  route_table_id = aws_route_table.main.id
}

resource "aws_subnet" "blue" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "ap-southeast-4a"

  tags = {
    name = "subnet-${var.app_name}-blue-1"
    app  = var.app_name
  }
}

resource "aws_subnet" "green" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "ap-southeast-4b"

  tags = {
    name = "subnet-${var.app_name}-green-1"
    app  = var.app_name
  }
}
