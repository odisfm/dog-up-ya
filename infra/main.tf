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
  filter {
    name = "image-id"
    values = ["ami-07b24db0d2671f1da"]
  }
}

resource "terraform_data" "always_replace" {
  input = timestamp()
}
