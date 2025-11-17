# Local Testing with Open-World ML API

Quick guide to test the personal website locally using Open-World ML API.

## Prerequisites

- Python 3.11+ with venv
- Node.js 18+
- Docker (for Redis)
- Access to Kubernetes cluster with Open-World API
- Open-World API credentials

## Step 1: Test Open-World API Connection

First, verify you can connect to the Open-World API.

### Option A: From within K8s cluster

If your machine is part of the K8s cluster or has network access to cluster services:

```bash
cd personal-website-v2
python3 test-openworld.py
```

### Option B: Using kubectl port-forward

If running outside the cluster:

```bash
# Terminal 1: Port-forward Open-World API
kubectl port-forward svc/api-gateway 8080:80 -n open-world

# Terminal 2: Run test with localhost endpoint
cd personal-website-v2
OPENAI_BASE_URL=http://localhost:8080/v1 python3 test-openworld.py
```

**Expected Output:**
```
Testing Open-World ML API Connection
====================================
✅ Found X models
✅ Response from tinyllama
✅ Response from qwen2.5:7b-instruct
✅ All tests passed!
```

If the test fails, follow the troubleshooting steps in the output.

## Step 2: Setup Backend

```bash
cd personal-website-v2/backend

# Create/activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies (if not already done)
pip install -r requirements.txt

# Copy Open-World configuration
cp .env.openworld .env

# If using port-forward, update .env:
# Change: OPENAI_BASE_URL=http://api-gateway.open-world.svc.cluster.local/v1
# To:     OPENAI_BASE_URL=http://localhost:8080/v1
```

## Step 3: Start Redis (Required for Rate Limiting)

```bash
# In a new terminal
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Verify Redis is running
docker ps | grep redis
```

## Step 4: Start Backend

```bash
# Terminal with backend venv activated
cd personal-website-v2/backend
source venv/bin/activate
uvicorn main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Check logs for LLM initialization:
```
[info     ] initializing_openai_compatible_llm base_url=http://... model=qwen2.5:7b-instruct
[info     ] initializing_classifier_llm provider=openai_compatible model=tinyllama:latest
```

## Step 5: Test Backend API

In a new terminal:

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Expected: {"status":"healthy","service":"edson-portfolio-api","version":"2.0.0"}

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Edson'\''s experience with MLOps?",
    "language": "en"
  }'
```

**Expected Response:**
```json
{
  "message": "Edson has extensive experience with MLOps...",
  "conversation_id": "...",
  "tokens_used": 42,
  "agent_used": "technical",
  ...
}
```

## Step 6: Start Frontend

```bash
# In a new terminal
cd personal-website-v2/frontend

# Install dependencies (if not already done)
npm install

# Start dev server
npm run dev
```

**Access:** http://localhost:3000

## Step 7: Test Full Stack

1. Open http://localhost:3000 in browser
2. Scroll to chatbot section
3. Type a message: "Tell me about Edson's experience"
4. Verify chatbot responds using Open-World API

**Check backend logs** to see:
- Agent routing (supervisor → technical/career/general)
- LLM calls to Open-World API
- Rate limiting checks
- Response generation

## Troubleshooting

### Backend won't start

**Check venv is activated:**
```bash
which python
# Should show: .../personal-website-v2/backend/venv/bin/python
```

**Check dependencies:**
```bash
pip install -r requirements.txt
```

### Can't connect to Open-World API

**If using cluster internal endpoint:**
```bash
# Verify you can resolve the service
nslookup api-gateway.open-world.svc.cluster.local

# Or ping it
ping api-gateway.open-world.svc.cluster.local
```

**If using port-forward:**
```bash
# Verify port-forward is running
ps aux | grep "port-forward"

# Test manually
curl http://localhost:8080/v1/models \
  -H "Authorization: Bearer sk-ow-AO33HZv_wjAIFUdjeYSXnGO3xCnaWUyMihYpwB3jT8U"
```

### Redis connection errors

```bash
# Check Redis is running
docker ps | grep redis

# If not running, start it
docker run -d --name redis -p 6379:6379 redis:7-alpine

# If already exists but stopped
docker start redis
```

### Frontend can't reach backend

**Check CORS settings** in `backend/main.py`:
```python
allow_origins=[
    "http://localhost:3000",  # Should be present
    ...
]
```

**Check frontend .env.local:**
```bash
cat frontend/.env.local
# Should have: NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Rate limiting triggers immediately

**Reset Redis:**
```bash
docker exec -it redis redis-cli FLUSHALL
```

### Model not found errors

**Check available models:**
```bash
curl http://localhost:8080/v1/models \
  -H "Authorization: Bearer sk-ow-AO33HZv_wjAIFUdjeYSXnGO3xCnaWUyMihYpwB3jT8U"
```

**Verify model names in .env match available models.**

## View Logs

**Backend logs:**
```bash
# In terminal running uvicorn, you'll see structured JSON logs
[info     ] request_completed method=POST path=/api/chat status_code=200 duration=1.234
```

**Frontend logs:**
```bash
# Check browser console (F12)
# Check terminal running npm run dev
```

## Performance Testing

Test multiple requests:

```bash
# Send 3 requests (should work within rate limit)
for i in {1..3}; do
  curl -X POST http://localhost:8000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"Hello","language":"en"}' \
    -s | jq -r '.message'
  echo "---"
done

# 4th request should trigger rate limit
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","language":"en"}'
# Expected: {"detail":"Rate limit exceeded: ..."}
```

## Stop Services

```bash
# Stop backend: Ctrl+C in uvicorn terminal
# Stop frontend: Ctrl+C in npm terminal
# Stop Redis:
docker stop redis
# Stop port-forward (if used): Ctrl+C
```

## Next Steps

Once local testing works:
1. Deploy to Kubernetes (see DEPLOY-OPENWORLD.md)
2. Configure ingress for external access
3. Set up monitoring
4. Configure domain and SSL

## Quick Reference

**Test commands:**
```bash
# Test Open-World API
python3 test-openworld.py

# Test backend health
curl http://localhost:8000/api/health

# Test chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","language":"en"}'

# View API docs
open http://localhost:8000/docs
```

**Service URLs:**
- Backend API: http://localhost:8000
- Backend Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Redis: localhost:6379
