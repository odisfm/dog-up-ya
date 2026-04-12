resource "cloudflare_dns_record" "api" {
  zone_id = var.cloudflare_zone_id
  name    = "api"
  type    = "CNAME"
  content = replace(aws_apigatewayv2_api.http.api_endpoint, "https://", "")
  ttl     = 1
  proxied = true
}
