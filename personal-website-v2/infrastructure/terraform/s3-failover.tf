# Terraform configuration for S3 static site failover

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Domain name"
  type        = string
  default     = "edsonzandamela.com"
}

variable "kubernetes_endpoint" {
  description = "Kubernetes ingress endpoint"
  type        = string
}

# S3 Bucket for static failover site
resource "aws_s3_bucket" "failover_site" {
  bucket = "${var.domain_name}-failover"

  tags = {
    Name        = "Edson Portfolio Failover"
    Environment = "Production"
    Purpose     = "Failover"
  }
}

# S3 Bucket Website Configuration
resource "aws_s3_bucket_website_configuration" "failover_site" {
  bucket = aws_s3_bucket.failover_site.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

# S3 Bucket Public Access Block (allow public access for website)
resource "aws_s3_bucket_public_access_block" "failover_site" {
  bucket = aws_s3_bucket.failover_site.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 Bucket Policy for public read access
resource "aws_s3_bucket_policy" "failover_site" {
  bucket = aws_s3_bucket.failover_site.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.failover_site.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.failover_site]
}

# CloudFront Distribution for S3 (Optional - for HTTPS and better performance)
resource "aws_cloudfront_distribution" "failover_site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name, "www.${var.domain_name}"]

  origin {
    domain_name = aws_s3_bucket_website_configuration.failover_site.website_endpoint
    origin_id   = "S3-${aws_s3_bucket.failover_site.id}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.failover_site.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name        = "Edson Portfolio Failover CDN"
    Environment = "Production"
  }
}

# ACM Certificate for HTTPS
resource "aws_acm_certificate" "cert" {
  domain_name       = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method = "DNS"

  tags = {
    Name = "Edson Portfolio Certificate"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Route53 Hosted Zone (assuming it exists)
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

# Route53 Health Check for Kubernetes endpoint
resource "aws_route53_health_check" "k8s" {
  fqdn              = var.kubernetes_endpoint
  port              = 443
  type              = "HTTPS"
  resource_path     = "/api/health"
  failure_threshold = 3
  request_interval  = 30

  tags = {
    Name = "K8s Cluster Health Check"
  }
}

# Route53 Record with Failover - Primary (Kubernetes)
resource "aws_route53_record" "primary" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  set_identifier = "primary"
  failover_routing_policy {
    type = "PRIMARY"
  }

  alias {
    name                   = var.kubernetes_endpoint
    zone_id                = data.aws_route53_zone.main.zone_id
    evaluate_target_health = true
  }

  health_check_id = aws_route53_health_check.k8s.id
}

# Route53 Record with Failover - Secondary (S3/CloudFront)
resource "aws_route53_record" "secondary" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  set_identifier = "secondary"
  failover_routing_policy {
    type = "SECONDARY"
  }

  alias {
    name                   = aws_cloudfront_distribution.failover_site.domain_name
    zone_id                = aws_cloudfront_distribution.failover_site.hosted_zone_id
    evaluate_target_health = false
  }
}

# Outputs
output "s3_bucket_name" {
  description = "S3 bucket name for failover site"
  value       = aws_s3_bucket.failover_site.id
}

output "s3_website_endpoint" {
  description = "S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.failover_site.website_endpoint
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain"
  value       = aws_cloudfront_distribution.failover_site.domain_name
}

output "health_check_id" {
  description = "Route53 health check ID"
  value       = aws_route53_health_check.k8s.id
}
