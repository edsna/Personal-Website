# Personal Website v2 - Open-World API Deployment

**Deployed:** November 17, 2025
**Environment:** Docker Compose (Local Development)
**LLM Provider:** Open-World ML API
**Status:** ✅ Successfully Deployed & Running

---

## 🎯 What Was Deployed

A full-stack AI-powered personal portfolio website with:
- **Frontend:** Next.js 14 (React, TypeScript) with 3D neural network background
- **Backend:** FastAPI with multi-agent RAG chatbot
- **AI Models:** Open-World ML API (qwen2.5:7b-instruct, tinyllama:latest)
- **Services:** Redis (rate limiting), PostgreSQL (analytics)

---

## 📝 Deployment Process Overview

### Step 1: Code Changes to Support Open-World API

**File Modified:** `backend/utils/llm_provider.py`

**What Changed:**
- Added support for custom `OPENAI_BASE_URL` environment variable
- Added support for custom model names via `OPENAI_MODEL` and `OPENAI_CLASSIFIER_MODEL`
- Modified both `get_llm()` and `get_classifier_llm()` functions to work with OpenAI-compatible APIs

**Before:**
```python
def get_llm(...):
    # Only supported OLLAMA_BASE_URL or standard OpenAI
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        return ChatOpenAI(
            model="gpt-3.5-turbo",  # Hardcoded model
            ...
        )
```

**After:**
```python
def get_llm(...):
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        openai_base_url = os.getenv("OPENAI_BASE_URL")  # NEW
        openai_model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")  # NEW

        kwargs = {
            "model": model_name or openai_model,
            ...
        }

        if openai_base_url:  # NEW
            kwargs["base_url"] = openai_base_url
            logger.info("initializing_openai_compatible_llm", ...)

        return ChatOpenAI(**kwargs)
```

**Why:** This allows the backend to use any OpenAI-compatible API (like Open-World ML API) instead of just standard OpenAI or Ollama.

---

### Step 2: Fixed Docker Build Issues

**File Modified:** `frontend/Dockerfile`

**What Changed:**
- Changed from Next.js standalone build to static export
- Switched from Node.js server to Nginx for serving static files

**Reason:** The Next.js config had `output: 'export'` which creates static files, but the Dockerfile expected a standalone server build.

**Before:**
```dockerfile
# Tried to copy .next/standalone which doesn't exist with output: 'export'
COPY --from=builder /app/.next/standalone ./
CMD ["node", "server.js"]
```

**After:**
```dockerfile
# Use nginx to serve the static 'out' directory
FROM nginx:alpine
COPY --from=builder /app/out .
CMD ["nginx", "-g", "daemon off;"]
```

---

### Step 3: Fixed Backend Permissions

**File Modified:** `backend/Dockerfile`

**What Changed:**
- Fixed file ownership issues when running as non-root user
- Moved Python packages to appuser's home directory instead of /root

**Before:**
```dockerfile
COPY --from=builder /root/.local /root/.local
RUN useradd -m -u 1000 appuser
USER appuser
ENV PATH=/root/.local/bin:$PATH  # appuser can't access /root!
```

**After:**
```dockerfile
RUN useradd -m -u 1000 appuser
COPY --from=builder /root/.local /home/appuser/.local
RUN chown -R appuser:appuser /app /home/appuser/.local
USER appuser
ENV PATH=/home/appuser/.local/bin:$PATH  # Correct path
```

---

### Step 4: Updated Docker Compose Configuration

**File Modified:** `docker-compose.yml`

**What Changed:**
- Added new environment variables for Open-World API configuration

**Added to backend service:**
```yaml
environment:
  - OPENAI_API_KEY=${OPENAI_API_KEY}
  - OPENAI_BASE_URL=${OPENAI_BASE_URL}        # NEW
  - OPENAI_MODEL=${OPENAI_MODEL}              # NEW
  - OPENAI_CLASSIFIER_MODEL=${OPENAI_CLASSIFIER_MODEL}  # NEW
```

---

### Step 5: Created Configuration File

**File Created:** `.env` (in project root)

**Contents:**
```bash
# Open-World ML API Configuration
# Using port-forward: kubectl port-forward svc/api-gateway 8080:80 -n open-world
OPENAI_API_KEY=sk-ow-mbVb_LXQCm1jqv6syTyo1-ftkvboBR5RtQG6rln3vKw
OPENAI_BASE_URL=http://192.168.197.177:8080/v1
OPENAI_MODEL=qwen2.5:7b-instruct
OPENAI_CLASSIFIER_MODEL=tinyllama:latest

# Frontend
NEXT_PUBLIC_CALENDAR_LINK=https://calendly.com/edsonzandamela
```

**Why:** This file provides environment variables to Docker Compose, which then passes them to the containers.

---

## 🔧 Technical Details

### Open-World API Integration

**API Endpoint:** `http://192.168.197.177:8080/v1`
**API Key:** `sk-ow-mbVb_LXQCm1jqv6syTyo1-ftkvboBR5RtQG6rln3vKw` (project-specific)

**How It Works:**
1. Kubernetes port-forward exposes Open-World API gateway:
   ```bash
   kubectl port-forward svc/api-gateway 8080:80 -n open-world
   ```
2. Backend connects to `http://192.168.197.177:8080/v1` (your machine's IP)
3. Open-World API provides OpenAI-compatible endpoints
4. Backend uses standard OpenAI SDK with custom `base_url`

### Models Used

| Purpose | Model | Size | Use Case |
|---------|-------|------|----------|
| Main LLM | `qwen2.5:7b-instruct` | 4.7GB | Generating chatbot responses |
| Classifier | `tinyllama:latest` | 637MB | Fast query routing (career/technical/general) |

### Multi-Agent Architecture

**Supervisor Agent** routes queries to:
1. **CareerAgent** - Work experience, roles, companies
2. **TechnicalAgent** - Skills, technologies, projects
3. **GeneralAgent** - Education, background, contact info

**Flow:**
```
User Query → Content Filter → Rate Limiter → Supervisor (tinyllama)
                                                     ↓
                                    ┌────────────────┼────────────────┐
                                    ↓                ↓                ↓
                             CareerAgent    TechnicalAgent    GeneralAgent
                             (qwen2.5)        (qwen2.5)        (qwen2.5)
                                    ↓                ↓                ↓
                                    └────────────────┴────────────────┘
                                                     ↓
                                               Response to User
```

---

## 🚀 Deployment Commands

### Build Images
```bash
cd /home/spartan/Documents/Personal-Website/personal-website-v2
docker build -t edson-portfolio-backend:latest ./backend
docker build -t edson-portfolio-frontend:latest ./frontend
```

### Start Services
```bash
docker compose up -d backend frontend redis
```

### Restart Backend (after config changes)
```bash
docker compose restart backend
```

### View Logs
```bash
# Backend logs
docker logs personal-website-v2-backend-1 --tail 50 -f

# Frontend logs
docker logs personal-website-v2-frontend-1 --tail 50 -f

# All services
docker compose logs -f
```

### Stop Services
```bash
docker compose down
```

---

## ✅ Verification Steps

### 1. Check Service Status
```bash
docker compose ps
```

Expected output:
```
NAME                             STATUS
personal-website-v2-backend-1    Up
personal-website-v2-frontend-1   Up
personal-website-v2-redis-1      Up
personal-website-v2-postgres-1   Up
```

### 2. Test Backend Health
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{"status":"healthy","service":"edson-portfolio-api","version":"2.0.0"}
```

### 3. Test Open-World API Connection
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Edson'\''s experience?",
    "language": "en"
  }'
```

### 4. Test Frontend
Open browser to: http://localhost:3000

Expected: Website loads with neural network background and functional chatbot

---

## 📊 Service URLs

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | Main website |
| **Backend API** | http://localhost:8000 | FastAPI server |
| **API Docs** | http://localhost:8000/docs | Interactive Swagger UI |
| **Redis** | localhost:6379 | Rate limiting cache |
| **PostgreSQL** | localhost:5432 | Analytics database |

---

## 🔐 Security & Rate Limiting

### Rate Limits (per IP address)
- **Requests:** 3 per minute
- **Tokens:** 50 per day
- **Messages:** 10 per day

### Guardrails
1. **Content Filtering** - Validates input, blocks SQL injection/XSS
2. **Topic Classification** - Ensures questions are about Edson
3. **Token Tracking** - Redis-backed usage limits
4. **Jailbreak Detection** - Pattern matching for malicious prompts

---

## 📁 Key Files Modified/Created

### Modified Files
```
backend/
├── utils/llm_provider.py          # Added Open-World API support
├── Dockerfile                     # Fixed permissions for non-root user

frontend/
└── Dockerfile                     # Changed to static build with Nginx

docker-compose.yml                 # Added Open-World env vars
```

### Created Files
```
.env                              # Configuration for Open-World API
OPENWORLD-DEPLOYMENT.md           # This file
TEST-LOCAL-OPENWORLD.md           # Local testing guide
DEPLOY-OPENWORLD.md               # K8s deployment guide
test-openworld.py                 # API connection test script
backend/.env.openworld            # Example backend config
infrastructure/kubernetes/
└── backend-deployment-openworld.yaml  # K8s manifest for Open-World
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check logs:**
```bash
docker logs personal-website-v2-backend-1
```

**Common issues:**
- Missing API key in `.env`
- Port-forward to Open-World API not running
- Redis not started

**Fix:**
```bash
# Ensure port-forward is running
kubectl port-forward svc/api-gateway 8080:80 -n open-world

# Restart backend
docker compose restart backend
```

### Frontend Shows "Cannot connect to backend"

**Check:**
1. Backend is running: `curl http://localhost:8000/api/health`
2. Frontend env var is correct in `docker-compose.yml`:
   ```yaml
   NEXT_PUBLIC_API_URL=http://backend:8000
   ```

### Rate Limit Errors

**Reset Redis:**
```bash
docker exec -it personal-website-v2-redis-1 redis-cli FLUSHALL
```

### Open-World API Errors

**Test connection:**
```bash
cd /home/spartan/Documents/Personal-Website/personal-website-v2
python3 test-openworld.py
```

**Check API key is correct in `.env`**

---

## 📈 Monitoring

### View Metrics
```bash
curl http://localhost:8000/metrics
```

### Monitor Logs in Real-Time
```bash
docker compose logs -f backend
```

### Check Resource Usage
```bash
docker stats
```

---

## 🔄 Update & Redeploy Process

### 1. Update Configuration
```bash
# Edit .env file
nano /home/spartan/Documents/Personal-Website/personal-website-v2/.env

# Change API key or other settings
```

### 2. Restart Services
```bash
docker compose restart backend
```

### 3. Rebuild (if code changed)
```bash
docker compose build backend frontend
docker compose up -d
```

---

## 🎯 Success Criteria

✅ Backend starts without errors
✅ Frontend loads at http://localhost:3000
✅ Chatbot connects to Open-World API
✅ All 3 agents initialize successfully
✅ Rate limiting works (Redis connected)
✅ Health check returns 200 OK

**Current Status:** All criteria met ✅

---

## 📞 Quick Commands Reference

```bash
# Start everything
docker compose up -d

# Restart backend only (after .env changes)
docker compose restart backend

# View backend logs
docker logs -f personal-website-v2-backend-1

# Stop everything
docker compose down

# Rebuild and restart
docker compose build && docker compose up -d

# Test Open-World API connection
python3 test-openworld.py

# Check service status
docker compose ps
```

---

## 🚀 Next Steps

1. **Test the chatbot** at http://localhost:3000
2. **Monitor logs** for any errors
3. **Test different queries** to verify all agents work
4. **Deploy to Kubernetes** (once local testing is complete)
5. **Set up domain and SSL** for production

---

**Deployment completed successfully on November 17, 2025 at 3:33 PM EST**
