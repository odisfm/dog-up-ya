provider "aws" {
  region = "ap-southeast-4"
}

provider "cloudflare" {
}

terraform {
  backend "s3" {
    key          = "env/production/terraform.tfstate"
    encrypt      = true
    use_lockfile = true
  }
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "terraform_data" "always_replace" {
  input = timestamp()
}
