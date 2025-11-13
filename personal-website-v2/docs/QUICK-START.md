# Quick Start Guide

Get Edson's Personal Website running locally in 5 minutes!

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

## Option 1: Docker Compose (Recommended for Testing)

```bash
# 1. Clone and navigate to the project
cd personal-website-v2

# 2. Create environment file for backend
cat > backend/.env << EOF
OPENAI_API_KEY=sk-your-key-here
REDIS_URL=redis://redis:6379/0
MAX_TOKENS_PER_DAY=50
MAX_REQUESTS_PER_MINUTE=3
LOG_LEVEL=INFO
EOF

# 3. Create environment file for frontend
cat > frontend/.env << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CALENDAR_LINK=https://calendly.com/edsonzandamela
NEXT_PUBLIC_RESUME_PDF=/resume.pdf
EOF

# 4. Start all services
docker-compose up

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs (Swagger UI)
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

## Option 2: Local Development (Frontend + Backend Separately)

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set NEXT_PUBLIC_API_URL=http://localhost:8000

# Run development server
npm run dev

# Access at http://localhost:3000
```

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start Redis (required)
docker run -d -p 6379:6379 redis:7-alpine

# Run backend
uvicorn main:app --reload

# Access at http://localhost:8000
# API docs: http://localhost:8000/docs
```

## Testing the Chatbot

### Using the Web Interface

1. Navigate to http://localhost:3000
2. Scroll down to the "Edson's Minion" section
3. Type a question like:
   - "What is Edson's current role?"
   - "Tell me about Edson's AI experience"
   - "What certifications does Edson have?"

### Using the API Directly

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Edson'\''s current role?",
    "language": "en"
  }'

# Check token usage
curl http://localhost:8000/api/chat/usage
```

## Common Issues

### "Redis connection failed"
```bash
# Start Redis
docker run -d -p 6379:6379 redis:7-alpine
```

### "OPENAI_API_KEY not set"
```bash
# Set environment variable
export OPENAI_API_KEY=sk-your-key-here

# Or add to backend/.env file
echo "OPENAI_API_KEY=sk-your-key-here" >> backend/.env
```

### "Port already in use"
```bash
# Check what's using the port
lsof -i :3000  # Frontend
lsof -i :8000  # Backend

# Kill the process or use different ports
```

### Frontend build errors
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

## Next Steps

1. **Customize Content**
   - Edit `backend/agents/career_agent.py` to update career info
   - Edit `frontend/pages/index.tsx` to customize frontend
   - Replace resume PDF in `frontend/public/resume.pdf`

2. **Deploy to Kubernetes**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for full guide
   - Use `deploy.sh` script for automated deployment

3. **Set Up Monitoring**
   - Access Grafana at http://localhost:3001
   - Import dashboards from `infrastructure/grafana-dashboards/`
   - Set up alerts for rate limits and errors

## Environment Variables Reference

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CALENDAR_LINK=https://calendly.com/edsonzandamela
NEXT_PUBLIC_RESUME_PDF=/resume.pdf
```

### Backend (.env)
```env
OPENAI_API_KEY=sk-...
REDIS_URL=redis://localhost:6379/0
MAX_TOKENS_PER_DAY=50
MAX_REQUESTS_PER_MINUTE=3
MAX_MESSAGES_PER_DAY=10
LOG_LEVEL=INFO
```

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Saves to any file trigger automatic reload
- Backend: `--reload` flag enables auto-restart on code changes

### Debugging

```bash
# Backend: Enable debug logs
LOG_LEVEL=DEBUG uvicorn main:app --reload

# Frontend: Use React DevTools
# Install: https://react.dev/learn/react-developer-tools
```

### Testing Rate Limits

```bash
# Reset usage for your IP
curl -X POST http://localhost:8000/api/chat/reset-usage

# Check current usage
curl http://localhost:8000/api/chat/usage
```

## Support

Need help? Check:
- [Full Deployment Guide](./DEPLOYMENT.md)
- [Main README](../README.md)
- Open an issue on GitHub
- Email: edsonaguiar17@gmail.com
