# Edson Zandamela - Personal Website V2

A futuristic, AI-powered personal portfolio website showcasing GenAI/MLOps expertise through interactive experiences.

## 🚀 Features

### Phase 1 (MVP)
- **Neural Network Background**: GPU-accelerated particle effects representing AI/ML work
- **3D Terminal Interface**: Interactive command-line style navigation
- **Interactive Timeline**: Before & After career journey visualization
- **Modern About Section**: Highlighting expertise in GenAI, MLOps, and Infrastructure
- **Resume Download**: Direct PDF access
- **Calendar Integration**: Easy meeting scheduling

### Phase 2 (AI Integration)
- **Edson's Minion**: Multi-agent RAG chatbot powered by LangGraph
- **Smart Guardrails**: Token limiting, rate limiting, content filtering
- **Topic Classification**: Ensures chatbot stays on-topic (only answers about Edson)

### Phase 3 (Advanced)
- **Live Infrastructure Metrics**: Real-time K8s cluster health visualization
- **Interactive Demos**: Hands-on examples of RAG, cost optimization, etc.
- **Bilingual Support**: English/Portuguese with cultural integration

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  CloudFlare CDN (Optional)          │
└─────────────┬───────────────────────┘
              │
    ┌─────────▼──────────┐
    │   Route53 (DNS)     │
    │   Health Checks     │
    └─────────┬───────────┘
              │
    ┌─────────▼─────────────────────┐
    │  Primary: K8s Cluster         │
    │  Fallback: S3 Static Site     │
    └─────────┬─────────────────────┘
              │
┌─────────────▼──────────────────┐
│   Kubernetes Cluster            │
├─────────────────────────────────┤
│ ├─ Frontend (Next.js)           │
│ ├─ Backend (FastAPI)            │
│ ├─ Multi-Agent RAG (LangGraph)  │
│ ├─ LLM (Llama 3.2/Mistral)      │
│ ├─ Vector DB (Weaviate/Chroma)  │
│ ├─ Redis (Rate Limiting)        │
│ ├─ PostgreSQL (Analytics)       │
│ └─ Prometheus/Grafana           │
└─────────────────────────────────┘
```

## 📁 Project Structure

```
personal-website-v2/
├── frontend/                 # Next.js application
│   ├── components/          # React components
│   ├── pages/               # Next.js pages
│   ├── public/              # Static assets
│   ├── styles/              # CSS/styling
│   └── utils/               # Utility functions
│
├── backend/                 # FastAPI application
│   ├── api/                 # API routes
│   ├── agents/              # LangGraph multi-agent system
│   ├── guardrails/          # Security & rate limiting
│   ├── models/              # Data models
│   └── utils/               # Helper functions
│
├── infrastructure/
│   ├── kubernetes/          # K8s manifests
│   ├── terraform/           # IaC for AWS resources
│   └── docker/              # Dockerfiles
│
└── docs/                    # Documentation
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (React, TypeScript)
- Three.js / React Three Fiber (3D effects)
- Tailwind CSS (Styling)
- Framer Motion (Animations)

**Backend:**
- FastAPI (Python)
- LangGraph (Multi-agent orchestration)
- LangChain (RAG pipeline)
- Weaviate/Chroma (Vector database)
- Redis (Rate limiting & caching)
- PostgreSQL (Analytics)

**Infrastructure:**
- Kubernetes (Primary hosting)
- AWS S3 + CloudFront (Failover)
- Route53 (DNS with health checks)
- Prometheus/Grafana (Monitoring)
- Docker (Containerization)

**LLM Models:**
- Llama 3.2 (Primary)
- Mistral 7B (Backup)
- OpenAI API (Optional fallback)

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- kubectl (for K8s deployment)
- Access to K8s cluster

### Local Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
# Runs on http://localhost:8000
```

**Full Stack (Docker Compose):**
```bash
docker-compose up
```

## 🔒 Security Features

### Chatbot Guardrails
1. **Rate Limiting**: 3 requests/minute, 50 tokens/day per IP
2. **Content Filtering**: Topic classification to block off-topic queries
3. **Input Validation**: SQL injection, XSS prevention
4. **Output Filtering**: PII leakage detection
5. **Token Bucket**: Redis-based per-IP limiting
6. **Jailbreak Detection**: Pattern matching for malicious prompts

## 📊 Monitoring

- Prometheus metrics for API performance
- Grafana dashboards for visualization
- CloudWatch integration (if using AWS)
- Custom analytics for chatbot usage

## 🌍 Deployment

### Kubernetes (Primary)
```bash
kubectl apply -f infrastructure/kubernetes/
```

### S3 Failover
```bash
cd frontend
npm run build
npm run export
aws s3 sync out/ s3://your-bucket-name --delete
```

## 📝 Environment Variables

See `.env.example` files in frontend/ and backend/ directories.

## 🎨 Design Philosophy

**"Neural Network Aesthetic"**
- Dark navy background (#0a0e27)
- Electric blue accents (#00d9ff)
- White text (#ffffff)
- Terminal green highlights (#00ff88)
- GPU-accelerated particle effects
- Smooth transitions and animations
- Data visualization elements

## 📄 License

MIT License - See LICENSE file

## 👤 Author

**Edson Zandamela**
- Website: [edsonzandamela.com](https://edsonzandamela.com)
- LinkedIn: [linkedin.com/in/edsonzandamela](https://linkedin.com/in/edsonzandamela)
- GitHub: [github.com/edsna](https://github.com/edsna)
- Email: edsonaguiar17@gmail.com

---

Built with ❤️ using GenAI, MLOps, and a lot of coffee ☕
