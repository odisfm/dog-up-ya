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

resource "terraform_data" "always_replace" {
  input = timestamp()
}
