# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains two versions of a personal portfolio website for Edson Zandamela:
- **Root directory**: Legacy HTML/CSS/JS website (v1)
- **personal-website-v2/**: Modern AI-powered portfolio with multi-agent RAG chatbot

**Primary development happens in `personal-website-v2/`**. Unless explicitly asked to work on the legacy version, always work in the v2 directory.

## Quick Start Commands

### Development (Run Both Servers)

**Backend (Terminal 1):**
```bash
cd personal-website-v2/backend
source venv/bin/activate
uvicorn main:app --reload
# Runs on http://localhost:8000
# API docs: http://localhost:8000/docs
```

**Frontend (Terminal 2):**
```bash
cd personal-website-v2/frontend
npm run dev
# Runs on http://localhost:3000
```

### First-Time Setup

```bash
cd personal-website-v2
./setup-backend.sh   # Sets up Python venv, installs deps, creates .env
./setup-frontend.sh  # Installs npm packages, creates .env.local
```

### Testing

```bash
cd personal-website-v2
./test-backend.sh    # Tests backend API endpoints
./test-deployment.sh # Full deployment test
```

### Docker Compose (Full Stack)

```bash
cd personal-website-v2
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001
```

### Build Commands

**Frontend:**
```bash
cd personal-website-v2/frontend
npm run build        # Production build
npm run lint         # ESLint
npm run export       # Static export for S3
```

**Backend:**
```bash
cd personal-website-v2/backend
pytest               # Run tests (if available)
```

## Architecture Overview

### Multi-Agent RAG System

The backend uses a **supervisor pattern** with specialized agents:

1. **SupervisorAgent** (`backend/agents/supervisor.py`): Routes queries to specialized agents
   - Uses a classifier LLM to determine intent
   - Returns agent type: "career", "technical", or "general"

2. **CareerAgent** (`backend/agents/career_agent.py`): Handles work experience, roles, companies

3. **TechnicalAgent** (`backend/agents/technical_agent.py`): Handles skills, technologies, projects

4. **GeneralAgent** (`backend/agents/general_agent.py`): Handles education, background, contact info

**Key Design Pattern:**
- All agents inherit from a common base pattern
- Each agent has RAG context specific to its domain
- The supervisor uses a fast classifier model for routing
- Main responses use a larger model (e.g., llama3.2:3b)

### LLM Provider Abstraction

**Location:** `backend/utils/llm_provider.py`

The system supports multiple LLM providers with fallback:
1. **Ollama** (primary): Self-hosted models (llama3.2:3b, phi3:mini)
2. **OpenAI** (fallback): GPT models via API
3. **Anthropic** (fallback): Claude models via API

**Two LLM types:**
- `get_main_llm()`: Larger model for generating responses
- `get_classifier_llm()`: Smaller, faster model for routing

### Guardrails System

**Location:** `backend/guardrails/`

1. **RateLimiter** (`rate_limiter.py`):
   - Redis-backed token bucket algorithm
   - Limits: 3 req/min, 50 tokens/day, 10 messages/day per IP
   - Tracks both requests and token usage

2. **ContentFilter** (`content_filter.py`):
   - Input validation (max length, SQL injection, XSS)
   - Topic classification (ensures questions are about Edson)
   - Jailbreak detection

**All chat requests go through:**
1. Rate limiting check
2. Input validation
3. Topic classification
4. Agent processing
5. Response generation

### Frontend Architecture

**Framework:** Next.js 14 (TypeScript, React 18)

**Key Components:**
- `NeuralBackground.tsx`: GPU-accelerated particle system (Three.js)
- `Terminal.tsx`: 3D terminal interface for navigation
- `ChatBot.tsx`: Multi-agent chatbot UI with bilingual support
- `ConsultingServices.tsx`: Services section (EN/PT)
- `ContactForm.tsx`: Contact form component

**3D Rendering:**
- Uses `@react-three/fiber` and `@react-three/drei`
- Three.js for WebGL rendering
- Framer Motion for animations

**Styling:**
- Tailwind CSS for utility classes
- Custom neural network aesthetic:
  - Background: #0a0e27 (dark navy)
  - Accent: #00d9ff (electric blue)
  - Highlight: #00ff88 (terminal green)

## Configuration Files

### Backend Environment (`backend/.env`)

```bash
# LLM Provider (choose one)

# Option 1: Ollama (self-hosted)
OLLAMA_BASE_URL=http://192.168.197.150:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_CLASSIFIER_MODEL=phi3:mini

# Option 2: Open-World ML API (Kubernetes cluster)
OPENAI_API_KEY=sk-ow-AO33HZv_wjAIFUdjeYSXnGO3xCnaWUyMihYpwB3jT8U
OPENAI_BASE_URL=http://api-gateway.open-world.svc.cluster.local/v1
OPENAI_MODEL=qwen2.5:7b-instruct
OPENAI_CLASSIFIER_MODEL=tinyllama:latest

# Option 3: OpenAI
OPENAI_API_KEY=sk-...

# Option 4: Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Rate Limiting
REDIS_URL=redis://localhost:6379/0
MAX_TOKENS_PER_DAY=50
MAX_REQUESTS_PER_MINUTE=3
MAX_MESSAGES_PER_DAY=10
```

### Frontend Environment (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CALENDAR_LINK=https://calendly.com/edsonzandamela
NEXT_PUBLIC_RESUME_PDF=/resume.pdf
```

## Key Development Patterns

### Adding a New Agent

1. Create agent file in `backend/agents/`
2. Inherit from common pattern (see existing agents)
3. Add RAG context specific to the agent's domain
4. Register in `supervisor.py` routing logic
5. Update supervisor prompt to include new agent type

### Adding a New API Endpoint

1. Create router in `backend/api/`
2. Define Pydantic models in `backend/models/`
3. Include router in `main.py`
4. Add guardrails if needed (rate limiting, content filtering)
5. Add Prometheus metrics tracking

### Modifying Frontend Components

- Components are in `frontend/components/`
- Pages use Next.js file-based routing in `frontend/pages/`
- TypeScript is required (.tsx files)
- Use Tailwind CSS for styling
- Ensure bilingual support (EN/PT) where applicable

## Infrastructure

### Kubernetes Deployment

**Manifests:** `infrastructure/kubernetes/`

The repository includes Kubernetes manifests for deploying to a K8s cluster:
- `namespace.yaml`: Creates `edson-portfolio` namespace
- `backend-deployment.yaml`: Backend service (2 replicas)
- `frontend-deployment.yaml`: Frontend service (2 replicas)
- `redis-deployment.yaml`: Redis for rate limiting
- `ingress.yaml`: Ingress configuration
- `secrets.yaml.example`: Template for secrets

#### Quick Deploy to Local Kubernetes

**Prerequisites:**
- Docker installed
- kubectl configured for your cluster
- Access to a container registry (or use local images)

**Step 1: Build Docker Images**

```bash
cd personal-website-v2

# Build backend
docker build -t edson-portfolio-backend:latest ./backend

# Build frontend
docker build -t edson-portfolio-frontend:latest ./frontend

# If using a remote cluster, tag and push to registry:
# docker tag edson-portfolio-backend:latest your-registry/edson-portfolio-backend:latest
# docker push your-registry/edson-portfolio-backend:latest
# (repeat for frontend)
```

**Step 2: Create Secrets**

```bash
# For Open-World API integration:
kubectl create secret generic backend-secrets \
  --from-literal=openai_api_key=sk-ow-AO33HZv_wjAIFUdjeYSXnGO3xCnaWUyMihYpwB3jT8U \
  --from-literal=openai_base_url=http://api-gateway.open-world.svc.cluster.local/v1 \
  -n edson-portfolio

# Or for OpenAI:
kubectl create secret generic backend-secrets \
  --from-literal=openai_api_key=sk-your-actual-key \
  -n edson-portfolio
```

**Step 3: Update Deployment Manifests**

Edit `infrastructure/kubernetes/backend-deployment.yaml` to add Open-World specific env vars:

```yaml
env:
- name: OPENAI_BASE_URL
  valueFrom:
    secretKeyRef:
      name: backend-secrets
      key: openai_base_url
- name: OPENAI_MODEL
  value: "qwen2.5:7b-instruct"
- name: OPENAI_CLASSIFIER_MODEL
  value: "tinyllama:latest"
```

**Step 4: Deploy**

```bash
cd infrastructure/kubernetes

# Create namespace
kubectl apply -f namespace.yaml

# Deploy Redis (required for rate limiting)
kubectl apply -f redis-deployment.yaml

# Deploy backend and frontend
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# (Optional) Apply ingress
kubectl apply -f ingress.yaml
```

**Step 5: Verify Deployment**

```bash
# Check pods are running
kubectl get pods -n edson-portfolio

# Check services
kubectl get svc -n edson-portfolio

# View logs
kubectl logs -f deployment/backend -n edson-portfolio
kubectl logs -f deployment/frontend -n edson-portfolio

# Port-forward for local testing
kubectl port-forward svc/frontend-service 3000:80 -n edson-portfolio
# Access at http://localhost:3000
```

### Using Open-World ML API

**What needs to change:**

The backend already supports OpenAI-compatible APIs through `utils/llm_provider.py`. To use Open-World API:

1. **Update backend `.env` or K8s secrets:**
   ```bash
   OPENAI_API_KEY=sk-ow-AO33HZv_wjAIFUdjeYSXnGO3xCnaWUyMihYpwB3jT8U
   OPENAI_BASE_URL=http://api-gateway.open-world.svc.cluster.local/v1
   OPENAI_MODEL=qwen2.5:7b-instruct  # For main responses
   OPENAI_CLASSIFIER_MODEL=tinyllama:latest  # For routing (fast/lightweight)
   ```

2. **No code changes required!** The LLM provider abstraction automatically uses OpenAI SDK with custom base URL.

3. **Recommended models from Open-World API:**
   - **Main LLM:** `qwen2.5:7b-instruct` (balanced performance/quality)
   - **Classifier:** `tinyllama:latest` (fast routing)
   - **Alternative main:** `qwen2.5:14b` (higher quality, slower)

4. **Rate limits:** Open-World API Standard tier provides 100 req/min, 10,000 req/day (higher than chatbot's internal limits)

**Testing Open-World Integration:**

```bash
# Update backend/.env with Open-World credentials
cd personal-website-v2/backend
source venv/bin/activate

# Test the connection
python -c "
from openai import OpenAI
client = OpenAI(
    api_key='sk-ow-AO33HZv_wjAIFUdjeYSXnGO3xCnaWUyMihYpwB3jT8U',
    base_url='http://api-gateway.open-world.svc.cluster.local/v1'
)
response = client.chat.completions.create(
    model='qwen2.5:7b-instruct',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
print(response.choices[0].message.content)
"

# Run backend with Open-World API
uvicorn main:app --reload
```

### S3 Static Failover

The frontend can be exported as a static site for S3/CloudFront:

```bash
cd frontend
npm run build
npm run export
aws s3 sync out/ s3://your-bucket-name --delete
```

### Monitoring

- **Prometheus:** Scrapes `/metrics` endpoint
- **Grafana:** Visualizes metrics
- **Custom metrics:** REQUEST_COUNT, REQUEST_DURATION (see `main.py`)

## Testing Strategy

### Manual Testing

1. Run `./test-backend.sh` to test all API endpoints
2. Check health: `curl http://localhost:8000/api/health`
3. Test chat: Send POST to `/api/chat` with message
4. Verify rate limiting, content filtering work

### Frontend Testing

1. Check all sections render
2. Test neural background animation
3. Test chatbot with various queries
4. Verify bilingual support (EN/PT toggle)
5. Test on different screen sizes

## Common Issues

### Ollama Connection Errors

If backend shows "Access denied" from Ollama:
1. Check Ollama server firewall: `sudo ufw allow 11434/tcp`
2. Verify models downloaded: `ollama list`
3. Test locally on Ollama server: `curl http://localhost:11434/api/tags`
4. Fallback: Use OpenAI/Anthropic API keys instead

### Rate Limiting Not Working

Rate limiting requires Redis:
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### Frontend Build Errors

```bash
cd frontend
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

## Important Notes

- **Resume PDF:** Must be placed at `frontend/public/resume.pdf`
- **CORS:** Backend allows localhost:3000 and edsonzandamela.com
- **Bilingual:** Chat API accepts `language` param ("en" or "pt")
- **Metrics:** Prometheus metrics available at `/metrics`
- **Health Check:** `/api/health` for liveness probes

## Repository Structure (v2 only)

```
personal-website-v2/
├── backend/
│   ├── agents/          # Multi-agent system (supervisor + specialized agents)
│   ├── api/             # FastAPI routers (chat, health)
│   ├── guardrails/      # Rate limiting, content filtering
│   ├── models/          # Pydantic models
│   ├── utils/           # LLM provider abstraction
│   ├── main.py          # FastAPI app entry point
│   └── requirements.txt
├── frontend/
│   ├── components/      # React components (ChatBot, Terminal, etc.)
│   ├── pages/           # Next.js pages (index.tsx)
│   ├── public/          # Static assets (resume.pdf goes here)
│   └── styles/
├── infrastructure/
│   ├── kubernetes/      # K8s manifests
│   ├── terraform/       # IaC for AWS
│   └── docker/          # Prometheus config
├── docker-compose.yml   # Full stack with Redis, PostgreSQL, monitoring
└── docs/                # Additional documentation
```
