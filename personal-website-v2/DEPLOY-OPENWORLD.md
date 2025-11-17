# Deploy Personal Website v2 with Open-World ML API

Quick guide to deploy the personal website to Kubernetes using the Open-World ML API for AI chatbot.

## Prerequisites

- kubectl configured for your cluster
- Docker installed
- Access to `edson-portfolio` namespace (or create it)
- Open-World API credentials

## Quick Deploy (5 Steps)

### Step 1: Build Docker Images

```bash
cd personal-website-v2

# Build backend
docker build -t edson-portfolio-backend:latest ./backend

# Build frontend
docker build -t edson-portfolio-frontend:latest ./frontend
```

### Step 2: Create Namespace (if needed)

```bash
kubectl apply -f infrastructure/kubernetes/namespace.yaml
```

### Step 3: Create Secrets

```bash
kubectl create secret generic backend-secrets \
  --from-literal=openai_api_key=sk-ow-AO33HZv_wjAIFUdjeYSXnGO3xCnaWUyMihYpwB3jT8U \
  -n edson-portfolio
```

### Step 4: Deploy Services

```bash
cd infrastructure/kubernetes

# Deploy Redis (required for rate limiting)
kubectl apply -f redis-deployment.yaml

# Deploy backend with Open-World API
kubectl apply -f backend-deployment-openworld.yaml

# Deploy frontend
kubectl apply -f frontend-deployment.yaml
```

### Step 5: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n edson-portfolio

# Expected output:
# NAME                        READY   STATUS    RESTARTS   AGE
# backend-xxxxxxxxxx-xxxxx    1/1     Running   0          1m
# backend-xxxxxxxxxx-xxxxx    1/1     Running   0          1m
# frontend-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
# frontend-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
# redis-xxxxxxxxxx-xxxxx      1/1     Running   0          2m

# Check services
kubectl get svc -n edson-portfolio

# Expected output:
# NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
# backend-service    ClusterIP   10.x.x.x        <none>        8000/TCP   1m
# frontend-service   ClusterIP   10.x.x.x        <none>        80/TCP     1m
# redis-service      ClusterIP   10.x.x.x        <none>        6379/TCP   2m
```

## Testing

### Test Backend API

```bash
# Port-forward backend
kubectl port-forward svc/backend-service 8000:8000 -n edson-portfolio

# In another terminal, test health endpoint
curl http://localhost:8000/api/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about Edson'\''s experience with MLOps",
    "language": "en"
  }'
```

### Test Frontend

```bash
# Port-forward frontend
kubectl port-forward svc/frontend-service 3000:80 -n edson-portfolio

# Open browser to http://localhost:3000
# Test chatbot functionality
```

## View Logs

```bash
# Backend logs
kubectl logs -f deployment/backend -n edson-portfolio

# Frontend logs
kubectl logs -f deployment/frontend -n edson-portfolio

# Redis logs
kubectl logs -f deployment/redis -n edson-portfolio
```

## Configuration Details

### Open-World API Settings

The deployment uses these settings (configured in `backend-deployment-openworld.yaml`):

- **API Endpoint:** `http://api-gateway.open-world.svc.cluster.local/v1`
- **API Key:** `sk-ow-AO33HZv_wjAIFUdjeYSXnGO3xCnaWUyMihYpwB3jT8U`
- **Main Model:** `qwen2.5:7b-instruct` (for generating responses)
- **Classifier Model:** `tinyllama:latest` (for routing queries)

### Rate Limits

Backend enforces these limits (per IP):
- 3 requests/minute
- 50 tokens/day
- 10 messages/day

Open-World API tier limits:
- 100 requests/minute
- 10,000 requests/day

## Exposing Externally (Optional)

### Option 1: NodePort

Edit `frontend-deployment.yaml` to change service type:

```yaml
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 3000
    nodePort: 30080  # Choose a port 30000-32767
```

Access at `http://<node-ip>:30080`

### Option 2: Ingress

```bash
# Apply ingress configuration
kubectl apply -f ingress.yaml

# Check ingress
kubectl get ingress -n edson-portfolio
```

Configure DNS to point to your ingress controller.

## Troubleshooting

### Pods Not Starting

```bash
# Describe pod to see events
kubectl describe pod <pod-name> -n edson-portfolio

# Check logs
kubectl logs <pod-name> -n edson-portfolio
```

### Backend Can't Connect to Open-World API

```bash
# Test from inside backend pod
kubectl exec -it deployment/backend -n edson-portfolio -- /bin/bash

# Inside pod:
curl http://api-gateway.open-world.svc.cluster.local/v1/models \
  -H "Authorization: Bearer sk-ow-AO33HZv_wjAIFUdjeYSXnGO3xCnaWUyMihYpwB3jT8U"

# Should return list of available models
```

### Frontend Can't Connect to Backend

Check that frontend is configured with correct backend URL:

```bash
kubectl get deployment frontend -n edson-portfolio -o yaml | grep NEXT_PUBLIC_API_URL

# Should show: NEXT_PUBLIC_API_URL=http://backend-service:8000
```

### Redis Connection Issues

```bash
# Test Redis connectivity
kubectl exec -it deployment/backend -n edson-portfolio -- /bin/bash

# Inside pod:
nc -zv redis-service 6379

# Should show: Connection to redis-service 6379 port [tcp/*] succeeded!
```

## Update Deployment

### Update Backend Image

```bash
# Rebuild image
docker build -t edson-portfolio-backend:latest ./backend

# Restart deployment to use new image
kubectl rollout restart deployment/backend -n edson-portfolio

# Watch rollout status
kubectl rollout status deployment/backend -n edson-portfolio
```

### Update Environment Variables

```bash
# Edit deployment
kubectl edit deployment backend -n edson-portfolio

# Or apply updated manifest
kubectl apply -f infrastructure/kubernetes/backend-deployment-openworld.yaml
```

### Update Secrets

```bash
# Delete old secret
kubectl delete secret backend-secrets -n edson-portfolio

# Create new secret
kubectl create secret generic backend-secrets \
  --from-literal=openai_api_key=new-key-here \
  -n edson-portfolio

# Restart backend to use new secret
kubectl rollout restart deployment/backend -n edson-portfolio
```

## Clean Up

To remove the entire deployment:

```bash
kubectl delete namespace edson-portfolio
```

Or delete individual components:

```bash
kubectl delete -f infrastructure/kubernetes/backend-deployment-openworld.yaml
kubectl delete -f infrastructure/kubernetes/frontend-deployment.yaml
kubectl delete -f infrastructure/kubernetes/redis-deployment.yaml
kubectl delete secret backend-secrets -n edson-portfolio
```

## Performance Tuning

### Scale Replicas

```bash
# Scale backend
kubectl scale deployment backend --replicas=3 -n edson-portfolio

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n edson-portfolio
```

### Adjust Resources

Edit resource requests/limits in deployment manifests:

```yaml
resources:
  requests:
    cpu: 500m      # Increase for better performance
    memory: 512Mi
  limits:
    cpu: 2000m
    memory: 2Gi
```

## Monitoring

View Prometheus metrics:

```bash
# Port-forward backend
kubectl port-forward svc/backend-service 8000:8000 -n edson-portfolio

# Access metrics
curl http://localhost:8000/metrics
```

## Next Steps

1. Configure ingress with TLS/SSL
2. Set up monitoring with Prometheus/Grafana
3. Configure horizontal pod autoscaling (HPA)
4. Set up CI/CD pipeline for automated deployments
5. Configure persistent storage for Redis (optional)

## Support

For issues:
- Check logs: `kubectl logs -f deployment/backend -n edson-portfolio`
- Check events: `kubectl get events -n edson-portfolio`
- Verify connectivity to Open-World API
- Check secrets are configured correctly
