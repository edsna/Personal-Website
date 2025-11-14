# Quick Start Guide - Personal Website v2

## Prerequisites

- **Python 3.11+**: Check with `python3 --version`
- **Node.js 18+**: Check with `node --version`
- **npm**: Check with `npm --version`
- **Git**: Check with `git --version`

---

## 🚀 Setup (First Time Only)

### 1. Clone/Pull the Repository

```bash
cd ~/Documents/Personal-Website  # or wherever you cloned the repo
git pull origin claude/understand-po-011CV6GbD2hBChzZCimyiK7L
```

### 2. Run Setup Scripts

The project includes automated setup scripts that handle everything:

```bash
cd personal-website-v2

# Setup backend (installs Python dependencies)
./setup-backend.sh

# Setup frontend (installs Node dependencies)
./setup-frontend.sh
```

**What these scripts do:**
- Create Python virtual environment
- Install all Python packages
- Create `.env` configuration files
- Install all Node.js packages
- Verify everything works

---

## 🏃 Running the Application

You need **TWO separate terminal windows**:

### Terminal 1: Backend API

```bash
cd ~/Documents/Personal-Website/personal-website-v2/backend
source venv/bin/activate
uvicorn main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

✅ Backend API: http://localhost:8000
✅ API Docs: http://localhost:8000/docs

### Terminal 2: Frontend

```bash
cd ~/Documents/Personal-Website/personal-website-v2/frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 14.2.33
- Local:        http://localhost:3000
```

✅ Website: http://localhost:3000

---

## 🧪 Testing (Optional)

Quick test scripts are included:

```bash
cd personal-website-v2

# Test backend only
./test-backend.sh

# Both servers need to be started manually (see above)
```

---

## ⚙️ Configuration

### Backend Configuration

Edit `backend/.env` (created from `.env.example`):

```bash
# Ollama (self-hosted LLM)
OLLAMA_BASE_URL=http://192.168.197.150:11434
OLLAMA_MODEL=llama3.2:3b

# Redis (for rate limiting - optional)
REDIS_URL=redis://localhost:6379/0

# Rate limits
MAX_TOKENS_PER_DAY=50
MAX_REQUESTS_PER_MINUTE=3
MAX_MESSAGES_PER_DAY=10
```

**Important:** If Ollama server shows "Access denied", you can:
- Use OpenAI instead: Set `OPENAI_API_KEY=sk-...`
- Use Anthropic instead: Set `ANTHROPIC_API_KEY=sk-ant-...`
- Fix Ollama access (see Troubleshooting below)

### Frontend Configuration

Edit `frontend/.env.local` (created from `.env.example`):

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Your links
NEXT_PUBLIC_CALENDAR_LINK=https://calendly.com/edsonzandamela
NEXT_PUBLIC_RESUME_PDF=/resume.pdf
```

---

## 📁 Add Your Resume PDF

Copy your resume to the frontend public directory:

```bash
cp ~/path/to/Edson_Infra.pdf personal-website-v2/frontend/public/resume.pdf
```

---

## 🔧 Troubleshooting

### Backend Errors

**Error:** `ModuleNotFoundError: No module named 'XXX'`
**Fix:** Make sure virtual environment is activated and dependencies installed:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Error:** `Ollama server returns "Access denied"`
**Fix:** On your Ollama server (192.168.197.150):
```bash
# Allow port 11434 through firewall
sudo ufw allow 11434/tcp

# Verify Ollama is running
ollama list

# Test locally on that server
curl http://localhost:11434/api/tags
```

**Temporary workaround:** Use OpenAI API instead:
```bash
# In backend/.env
OPENAI_API_KEY=sk-your-key-here
# Comment out OLLAMA_BASE_URL
```

### Frontend Errors

**Error:** `Cannot find module 'XXX'`
**Fix:** Reinstall dependencies:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error:** `Port 3000 already in use`
**Fix:** Kill the process or use a different port:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
PORT=3001 npm run dev
```

### Health Check

Verify backend is working:
```bash
curl http://localhost:8000/api/health
# Should return: {"status":"healthy","service":"edson-portfolio-api","version":"2.0.0"}
```

---

## 🐳 Docker (Alternative)

If you prefer Docker, use docker-compose:

```bash
cd personal-website-v2

# Build and start both services
docker-compose up --build

# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

---

## 📊 Project Structure

```
personal-website-v2/
├── backend/               # FastAPI backend
│   ├── venv/             # Python virtual environment (created by setup)
│   ├── .env              # Backend config (created by setup)
│   ├── main.py           # FastAPI app entry point
│   ├── agents/           # Multi-agent system
│   ├── api/              # API endpoints
│   ├── guardrails/       # Security & rate limiting
│   └── utils/            # LLM provider, helpers
├── frontend/             # Next.js frontend
│   ├── node_modules/     # Node dependencies (created by setup)
│   ├── .env.local        # Frontend config (created by setup)
│   ├── components/       # React components
│   ├── pages/            # Next.js pages
│   └── public/           # Static files (add resume here)
├── infrastructure/       # Kubernetes, Terraform
├── setup-backend.sh      # Backend setup script
├── setup-frontend.sh     # Frontend setup script
└── test-backend.sh       # Backend test script
```

---

## 🚀 Next Steps After Setup

1. ✅ Run both servers (backend + frontend)
2. ✅ Visit http://localhost:3000
3. ✅ Test the chatbot (if Ollama/OpenAI configured)
4. ✅ Verify all sections render correctly
5. 📝 Customize content in frontend/components/
6. 🚢 Deploy to your Kubernetes cluster

---

## 📖 Additional Documentation

- **TESTING-RESULTS.md** - Detailed test results and findings
- **OLLAMA-DEPLOYMENT.md** - Ollama-specific deployment guide
- **TESTING-GUIDE.md** - Comprehensive testing walkthrough
- **DEPLOYMENT-SUMMARY.md** - Production deployment overview
- **README.md** - Full project documentation

---

## 💡 Tips

- **Hot Reload:** Both backend (`--reload`) and frontend automatically reload on file changes
- **API Docs:** Interactive API documentation at http://localhost:8000/docs
- **Logs:** Backend shows structured JSON logs, frontend shows Next.js build logs
- **Debugging:** Check browser console (F12) for frontend errors
- **Rate Limiting:** Requires Redis running (`docker run -d -p 6379:6379 redis`)

---

## ✅ Success Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Ran `./setup-backend.sh` successfully
- [ ] Ran `./setup-frontend.sh` successfully
- [ ] Backend starts without errors
- [ ] Frontend builds and starts
- [ ] Can access http://localhost:3000
- [ ] Resume PDF copied to frontend/public/
- [ ] Configured Ollama/OpenAI in backend/.env
- [ ] All sections visible on website

---

**Need help?** Check `TESTING-RESULTS.md` for common issues and solutions.
