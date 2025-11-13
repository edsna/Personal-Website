# Deployment Guide

This guide covers deploying Edson's Personal Website to your Kubernetes cluster with S3 failover.

## Architecture Overview

```
┌─────────────────────────────────────┐
│          Route53 (DNS)               │
│      with Health Checks              │
└─────────────┬───────────────────────┘
              │
       ┌──────▼──────┐
       │  Failover   │
       │   Logic     │
       └──┬────────┬─┘
          │        │
    ┌─────▼──┐  ┌─▼──────────┐
    │  K8s   │  │ S3/CloudFrt│
    │Primary │  │  Fallback  │
    └────────┘  └────────────┘
```

## Prerequisites

### Required Tools
- Docker (v20+)
- kubectl (v1.25+)
- Kubernetes cluster (access configured)
- Terraform (v1.0+) - for AWS resources
- AWS CLI (configured with credentials)

### Required Credentials
- OpenAI API Key (for chatbot)
- Anthropic API Key (optional, for Claude)
- Docker registry access
- AWS credentials (for S3 failover)

## Step-by-Step Deployment

### 1. Local Development Setup

```bash
# Clone the repository
cd personal-website-v2

# Copy environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Update .env files with your credentials
```

### 2. Test Locally with Docker Compose

```bash
# Start all services
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Grafana: http://localhost:3001
# Prometheus: http://localhost:9090
```

### 3. Build and Push Docker Images

```bash
# Set your Docker registry
export DOCKER_REGISTRY=your-registry.com
export VERSION=v1.0.0

# Build images
docker build -t ${DOCKER_REGISTRY}/edson-portfolio-frontend:${VERSION} ./frontend
docker build -t ${DOCKER_REGISTRY}/edson-portfolio-backend:${VERSION} ./backend

# Push to registry
docker push ${DOCKER_REGISTRY}/edson-portfolio-frontend:${VERSION}
docker push ${DOCKER_REGISTRY}/edson-portfolio-backend:${VERSION}

# Tag as latest
docker tag ${DOCKER_REGISTRY}/edson-portfolio-frontend:${VERSION} \
           ${DOCKER_REGISTRY}/edson-portfolio-frontend:latest
docker tag ${DOCKER_REGISTRY}/edson-portfolio-backend:${VERSION} \
           ${DOCKER_REGISTRY}/edson-portfolio-backend:latest

docker push ${DOCKER_REGISTRY}/edson-portfolio-frontend:latest
docker push ${DOCKER_REGISTRY}/edson-portfolio-backend:latest
```

### 4. Deploy to Kubernetes

#### Option A: Using Deployment Script

```bash
# Set environment variables
export DOCKER_REGISTRY=your-registry.com
export VERSION=latest
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...  # Optional

# Run deployment script
./deploy.sh
```

#### Option B: Manual Deployment

```bash
# Create namespace
kubectl apply -f infrastructure/kubernetes/namespace.yaml

# Create secrets
kubectl create secret generic backend-secrets \
  --from-literal=openai_api_key=sk-... \
  --from-literal=anthropic_api_key=sk-ant-... \
  --namespace=edson-portfolio

# Apply configurations
kubectl apply -f infrastructure/kubernetes/configmap.yaml

# Deploy services
kubectl apply -f infrastructure/kubernetes/redis-deployment.yaml
kubectl apply -f infrastructure/kubernetes/backend-deployment.yaml
kubectl apply -f infrastructure/kubernetes/frontend-deployment.yaml

# Deploy ingress
kubectl apply -f infrastructure/kubernetes/ingress.yaml

# Check status
kubectl get all -n edson-portfolio
```

### 5. Set Up S3 Failover

#### Build Static Export for S3

```bash
# Build Next.js static export
cd frontend
npm run build

# The static files are in the 'out' directory
```

#### Deploy to S3 Using Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review plan
terraform plan \
  -var="domain_name=edsonzandamela.com" \
  -var="kubernetes_endpoint=your-k8s-ingress-endpoint.com"

# Apply configuration
terraform apply \
  -var="domain_name=edsonzandamela.com" \
  -var="kubernetes_endpoint=your-k8s-ingress-endpoint.com"

# Upload static files to S3
aws s3 sync ../frontend/out/ s3://edsonzandamela.com-failover/ --delete
```

#### Manual S3 Setup (Alternative)

```bash
# Create S3 bucket
aws s3 mb s3://edsonzandamela.com-failover

# Enable static website hosting
aws s3 website s3://edsonzandamela.com-failover \
  --index-document index.html \
  --error-document 404.html

# Upload files
aws s3 sync frontend/out/ s3://edsonzandamela.com-failover/ --delete

# Set bucket policy for public access
aws s3api put-bucket-policy \
  --bucket edsonzandamela.com-failover \
  --policy file://infrastructure/s3-bucket-policy.json
```

### 6. Configure Route53 Failover

Route53 is configured via Terraform (see step 5), which creates:
- Health check for Kubernetes endpoint
- Primary record (K8s)
- Secondary record (S3/CloudFront)

Manual configuration:
1. Go to Route53 console
2. Create health check for K8s endpoint
3. Create primary A record (Failover, Primary) pointing to K8s
4. Create secondary A record (Failover, Secondary) pointing to CloudFront

## Monitoring & Maintenance

### View Logs

```bash
# Backend logs
kubectl logs -f deployment/backend -n edson-portfolio

# Frontend logs
kubectl logs -f deployment/frontend -n edson-portfolio

# Redis logs
kubectl logs -f deployment/redis -n edson-portfolio
```

### Check Health

```bash
# Check all pods
kubectl get pods -n edson-portfolio

# Describe failing pod
kubectl describe pod <pod-name> -n edson-portfolio

# Check services
kubectl get svc -n edson-portfolio

# Check ingress
kubectl get ingress -n edson-portfolio
kubectl describe ingress edson-portfolio-ingress -n edson-portfolio
```

### Scale Deployments

```bash
# Scale backend
kubectl scale deployment/backend --replicas=3 -n edson-portfolio

# Scale frontend
kubectl scale deployment/frontend --replicas=3 -n edson-portfolio
```

### Update Deployment

```bash
# Update image version
kubectl set image deployment/backend \
  backend=${DOCKER_REGISTRY}/edson-portfolio-backend:v1.0.1 \
  -n edson-portfolio

# Rollout status
kubectl rollout status deployment/backend -n edson-portfolio

# Rollback if needed
kubectl rollout undo deployment/backend -n edson-portfolio
```

### Access Prometheus & Grafana

```bash
# Port-forward Prometheus
kubectl port-forward svc/prometheus -n edson-portfolio 9090:9090

# Port-forward Grafana
kubectl port-forward svc/grafana -n edson-portfolio 3001:3000
```

## Testing Failover

### Test Primary (K8s)
```bash
curl -I https://edsonzandamela.com
# Should return headers from K8s cluster
```

### Simulate K8s Failure
```bash
# Scale down all deployments
kubectl scale deployment/backend --replicas=0 -n edson-portfolio
kubectl scale deployment/frontend --replicas=0 -n edson-portfolio

# Wait 1-2 minutes for health check to fail
# Then test again
curl -I https://edsonzandamela.com
# Should now return headers from CloudFront/S3
```

### Restore K8s
```bash
kubectl scale deployment/backend --replicas=2 -n edson-portfolio
kubectl scale deployment/frontend --replicas=2 -n edson-portfolio

# Wait for health check to pass
# Traffic should automatically route back to K8s
```

## Troubleshooting

### Pods Not Starting
```bash
# Check events
kubectl get events -n edson-portfolio --sort-by='.lastTimestamp'

# Check pod details
kubectl describe pod <pod-name> -n edson-portfolio

# Common issues:
# - Image pull errors: Check registry credentials
# - OOMKilled: Increase memory limits
# - CrashLoopBackOff: Check logs for application errors
```

### Chatbot Not Working
```bash
# Check backend logs
kubectl logs deployment/backend -n edson-portfolio | grep -i error

# Verify secrets
kubectl get secret backend-secrets -n edson-portfolio

# Test API directly
kubectl port-forward svc/backend-service -n edson-portfolio 8000:8000
curl http://localhost:8000/api/health
```

### SSL Certificate Issues
```bash
# Check cert-manager (if using Let's Encrypt)
kubectl get certificate -n edson-portfolio
kubectl describe certificate edson-portfolio-tls -n edson-portfolio

# Check ingress
kubectl describe ingress edson-portfolio-ingress -n edson-portfolio
```

## Security Best Practices

1. **Secrets Management**
   - Never commit secrets to version control
   - Use Kubernetes secrets or external secret managers
   - Rotate API keys regularly

2. **Network Security**
   - Use NetworkPolicies to restrict pod-to-pod communication
   - Enable TLS/SSL for all external traffic
   - Configure proper CORS origins

3. **Rate Limiting**
   - Adjust rate limits based on usage patterns
   - Monitor for abuse via Prometheus metrics

4. **Updates**
   - Keep Docker images updated
   - Regularly update dependencies (npm, pip)
   - Monitor security advisories

## Cost Optimization

1. **Right-size Resources**
   - Monitor actual CPU/memory usage
   - Adjust requests/limits accordingly

2. **S3 Lifecycle Policies**
   - Set up lifecycle rules for old files
   - Use Intelligent-Tiering storage class

3. **CloudFront Caching**
   - Optimize cache TTLs
   - Use CloudFront for static assets

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

## Support

For issues or questions:
- Email: edsonaguiar17@gmail.com
- GitHub: https://github.com/edsna
