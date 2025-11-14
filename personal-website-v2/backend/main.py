"""
Edson Zandamela Personal Website - Backend API
FastAPI application with multi-agent RAG chatbot
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import structlog
from prometheus_client import Counter, Histogram, make_asgi_app
import time

from api import chat, health
from guardrails.rate_limiter import RateLimiter
from guardrails.content_filter import ContentFilter

# Setup logging
logger = structlog.get_logger()

# Metrics
REQUEST_COUNT = Counter('api_requests_total', 'Total API requests', ['endpoint', 'method', 'status'])
REQUEST_DURATION = Histogram('api_request_duration_seconds', 'API request duration', ['endpoint'])

# Initialize guardrails
rate_limiter = RateLimiter()
content_filter = ContentFilter()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management for the application"""
    logger.info("Starting up Edson's Personal Website API")
    # Startup logic here (e.g., initialize DB, load models)
    yield
    # Shutdown logic here
    logger.info("Shutting down Edson's Personal Website API")


# Initialize FastAPI app
app = FastAPI(
    title="Edson Zandamela - Personal Website API",
    description="Backend API for AI-powered personal portfolio with multi-agent RAG chatbot",
    version="2.0.0",
    lifespan=lifespan,
)

# Add Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://edsonzandamela.com",  # Production
        "https://www.edsonzandamela.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests and track metrics"""
    start_time = time.time()

    # Process request
    response = await call_next(request)

    # Calculate duration
    duration = time.time() - start_time

    # Log request
    logger.info(
        "request_completed",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration=duration,
    )

    # Update metrics
    REQUEST_COUNT.labels(
        endpoint=request.url.path,
        method=request.method,
        status=response.status_code,
    ).inc()

    REQUEST_DURATION.labels(endpoint=request.url.path).observe(duration)

    return response


# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(chat.router, prefix="/api", tags=["chat"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Edson Zandamela Personal Website API",
        "version": "2.0.0",
        "description": "AI-powered personal portfolio backend",
        "endpoints": {
            "health": "/api/health",
            "chat": "/api/chat",
            "metrics": "/metrics",
            "docs": "/docs",
        },
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    logger.error(
        "http_exception",
        path=request.url.path,
        status_code=exc.status_code,
        detail=exc.detail,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    logger.error(
        "unhandled_exception",
        path=request.url.path,
        exception=str(exc),
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
