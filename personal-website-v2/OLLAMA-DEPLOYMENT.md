# Ollama Deployment Guide

Complete guide to deploy your personal website using self-hosted Ollama models on Kubernetes.

## Part 1: Download Ollama Models

First, download the recommended models on your Ollama server:

```bash
# Connect to your Ollama server at 192.168.197.150
ssh user@192.168.197.150

# Download primary chatbot model (RECOMMENDED)
ollama pull llama3.2:3b

# Download classifier model for topic classification (OPTIONAL but recommended)
ollama pull phi3:mini

# Verify models are available
ollama list
```

**Expected output:**
```
NAME              ID              SIZE    MODIFIED
llama3.2:3b       abc123def       2.0 GB  2 minutes ago
phi3:mini         xyz789ghi       1.9 GB  1 minute ago
```

**Alternative Models** (if you want better quality):
- `mistral:7b` - Better responses, larger model (4GB)
- `llama3.2:8b` - Balanced quality/size (4.7GB)

## Part 2: Test Ollama Connection

Verify you can connect to Ollama from your network:

```bash
# Test from your local machine
curl http://192.168.197.150:11434/api/tags

# Should return JSON with available models
```

## Part 3: Create Kubernetes Namespace

```bash
# Navigate to project directory
cd /home/user/Personal-Website/personal-website-v2

# Create namespace
kubectl create namespace edson-portfolio

# Verify
kubectl get namespaces | grep edson
```

## Part 4: Create Secrets

```bash
# Create secrets for backend (NO API keys needed for Ollama!)
kubectl create secret generic backend-secrets \
  --from-literal=jwt_secret=$(openssl rand -base64 32) \
  --namespace=edson-portfolio

# Verify secret created
kubectl get secrets -n edson-portfolio
```

## Part 5: Create ConfigMap with Ollama Configuration

```bash
kubectl create configmap backend-config \
  --from-literal=ollama_base_url=http://192.168.197.150:11434 \
  --from-literal=ollama_model=llama3.2:3b \
  --from-literal=ollama_classifier_model=phi3:mini \
  --from-literal=max_tokens_per_day=50 \
  --from-literal=max_requests_per_minute=3 \
  --from-literal=max_messages_per_day=10 \
  --from-literal=log_level=INFO \
  --namespace=edson-portfolio

# Verify
kubectl get configmap backend-config -n edson-portfolio -o yaml
```

## Part 6: Update Backend Deployment for Ollama

The backend deployment needs to use the Ollama configuration. Update `infrastructure/kubernetes/backend-deployment.yaml`:

```yaml
# Add these environment variables to backend container:
env:
- name: OLLAMA_BASE_URL
  valueFrom:
    configMapKeyRef:
      name: backend-config
      key: ollama_base_url
- name: OLLAMA_MODEL
  valueFrom:
    configMapKeyRef:
      name: backend-config
      key: ollama_model
- name: OLLAMA_CLASSIFIER_MODEL
  valueFrom:
    configMapKeyRef:
      name: backend-config
      key: ollama_classifier_model
- name: REDIS_URL
  value: "redis://redis-service:6379/0"
- name: MAX_TOKENS_PER_DAY
  valueFrom:
    configMapKeyRef:
      name: backend-config
      key: max_tokens_per_day
- name: MAX_REQUESTS_PER_MINUTE
  valueFrom:
    configMapKeyRef:
      name: backend-config
      key: max_requests_per_minute
- name: MAX_MESSAGES_PER_DAY
  valueFrom:
    configMapKeyRef:
      name: backend-config
      key: max_messages_per_day
- name: LOG_LEVEL
  valueFrom:
    configMapKeyRef:
      name: backend-config
      key: log_level
- name: JWT_SECRET
  valueFrom:
    secretKeyRef:
      name: backend-secrets
      key: jwt_secret
```

## Part 7: Deploy to Kubernetes

```bash
# Deploy Redis first (required for rate limiting)
kubectl apply -f infrastructure/kubernetes/redis-deployment.yaml

# Wait for Redis to be ready
kubectl wait --for=condition=ready pod -l app=redis -n edson-portfolio --timeout=120s

# Deploy backend
kubectl apply -f infrastructure/kubernetes/backend-deployment.yaml

# Wait for backend
kubectl wait --for=condition=ready pod -l app=backend -n edson-portfolio --timeout=180s

# Deploy frontend
kubectl apply -f infrastructure/kubernetes/frontend-deployment.yaml

# Wait for frontend
kubectl wait --for=condition=ready pod -l app=frontend -n edson-portfolio --timeout=120s

# Deploy ingress
kubectl apply -f infrastructure/kubernetes/ingress.yaml
```

## Part 8: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n edson-portfolio

# Expected output:
# NAME                        READY   STATUS    RESTARTS   AGE
# backend-xxx-yyy             1/1     Running   0          2m
# backend-xxx-zzz             1/1     Running   0          2m
# frontend-xxx-yyy            1/1     Running   0          1m
# frontend-xxx-zzz            1/1     Running   0          1m
# redis-xxx-yyy               1/1     Running   0          3m

# Check services
kubectl get svc -n edson-portfolio

# Check ingress
kubectl get ingress -n edson-portfolio
```

## Part 9: Test the Application

### Test Health Endpoint

```bash
# Port-forward backend service
kubectl port-forward -n edson-portfolio svc/backend-service 8000:8000

# In another terminal, test health
curl http://localhost:8000/api/health

# Expected response:
# {"status":"healthy","service":"edson-portfolio-api","version":"2.0.0"}
```

### Test Chatbot

```bash
# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Edson'\''s current role?",
    "language": "en"
  }'

# Expected response (with actual answer about Edson):
# {
#   "message": "Edson Zandamela is currently...",
#   "conversation_id": "...",
#   "tokens_used": 45,
#   "tokens_remaining": 5,
#   "agent_used": "career_agent",
#   "confidence": 0.85,
#   "is_on_topic": true
# }
```

### Test Frontend

```bash
# Port-forward frontend service
kubectl port-forward -n edson-portfolio svc/frontend-service 3000:80

# Open browser to http://localhost:3000
```

## Part 10: View Logs

```bash
# Backend logs
kubectl logs -f deployment/backend -n edson-portfolio

# Frontend logs
kubectl logs -f deployment/frontend -n edson-portfolio

# Redis logs
kubectl logs -f deployment/redis -n edson-portfolio

# Filter for errors
kubectl logs deployment/backend -n edson-portfolio | grep -i error

# Filter for Ollama connections
kubectl logs deployment/backend -n edson-portfolio | grep -i ollama
```

## Part 11: Test Rate Limiting

```bash
# Check current usage
curl http://localhost:8000/api/chat/usage

# Send multiple requests to test rate limiting
for i in {1..5}; do
  echo "Request $i:"
  curl -X POST http://localhost:8000/api/chat \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Test $i\"}"
  echo ""
  sleep 1
done

# After 3 requests in a minute, you should see:
# {"error":"Rate limit exceeded: Too many requests per minute"}
```

## Troubleshooting

### Issue: Backend pods crashlooping

```bash
# Check logs
kubectl logs deployment/backend -n edson-portfolio

# Common causes:
# 1. Can't connect to Ollama - check OLLAMA_BASE_URL
# 2. Can't connect to Redis - check Redis is running
# 3. Missing models - run ollama pull llama3.2:3b
```

### Issue: "Connection refused" to Ollama

```bash
# Test Ollama connectivity from backend pod
kubectl exec -it deployment/backend -n edson-portfolio -- curl http://192.168.197.150:11434/api/tags

# If this fails, check:
# 1. Ollama server is running
# 2. Firewall allows connections from K8s network
# 3. IP address is correct
```

### Issue: Chatbot responds with fallback message

```bash
# Check backend logs for LLM initialization
kubectl logs deployment/backend -n edson-portfolio | grep -i "llm\|ollama"

# Should see:
# initializing_ollama_llm base_url=http://192.168.197.150:11434 model=llama3.2:3b
# supervisor_agent_initialized
# career_agent_initialized
```

### Issue: Models not found

```bash
# SSH to Ollama server and verify models
ssh user@192.168.197.150
ollama list

# If missing, pull them:
ollama pull llama3.2:3b
ollama pull phi3:mini
```

## Performance Tuning

### Model Selection Based on Hardware

**If you have limited RAM (<8GB):**
```bash
OLLAMA_MODEL=llama3.2:3b         # 2GB RAM
OLLAMA_CLASSIFIER_MODEL=phi3:mini # 2GB RAM
```

**If you have good RAM (>= 16GB):**
```bash
OLLAMA_MODEL=mistral:7b          # 4GB RAM - Better quality
OLLAMA_CLASSIFIER_MODEL=phi3:mini # 2GB RAM
```

**If you have lots of RAM (>=  32GB):**
```bash
OLLAMA_MODEL=llama3.2:8b         # 4.7GB RAM - Best balance
OLLAMA_CLASSIFIER_MODEL=llama3.2:3b # 2GB RAM
```

### Scale Based on Traffic

```bash
# Low traffic (testing)
kubectl scale deployment/backend --replicas=1 -n edson-portfolio
kubectl scale deployment/frontend --replicas=1 -n edson-portfolio

# Medium traffic (production)
kubectl scale deployment/backend --replicas=2 -n edson-portfolio
kubectl scale deployment/frontend --replicas=2 -n edson-portfolio

# High traffic
kubectl scale deployment/backend --replicas=3 -n edson-portfolio
kubectl scale deployment/frontend --replicas=3 -n edson-portfolio
```

## Monitoring

```bash
# Watch pods in real-time
watch kubectl get pods -n edson-portfolio

# Monitor resource usage
kubectl top pods -n edson-portfolio
kubectl top nodes

# Check events
kubectl get events -n edson-portfolio --sort-by='.lastTimestamp'
```

## Cost Savings vs OpenAI

With self-hosted Ollama:
- **API Costs**: $0 (vs ~$0.002/1K tokens with OpenAI)
- **For 1M requests/month**: Save ~$2,000/month
- **Privacy**: All data stays on your infrastructure
- **No rate limits**: Only limited by your hardware

## Next Steps

1. **Set up monitoring**: Deploy Prometheus/Grafana for metrics
2. **Add HTTPS**: Configure cert-manager for SSL certificates
3. **Set up S3 failover**: Use Terraform to configure Route53 failover
4. **Custom domain**: Point your domain to the K8s ingress
5. **Add more agents**: Extend with project-specific agents

## AWS/Route53 Requirements

**For basic K8s deployment**: NO AWS/Route53 needed - you can test everything locally!

**For S3 failover (optional)**:
- AWS Account
- Route53 hosted zone for your domain
- S3 bucket for static site
- See `docs/DEPLOYMENT.md` for S3 failover setup

You can deploy and test everything on K8s first, then add S3 failover later when you're ready!
