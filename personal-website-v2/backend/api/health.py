"""Health check endpoints"""

from fastapi import APIRouter, Response
import psutil
import os

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "service": "edson-portfolio-api",
        "version": "2.0.0",
    }


@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with system metrics"""
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    return {
        "status": "healthy",
        "service": "edson-portfolio-api",
        "version": "2.0.0",
        "system": {
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "memory_available_mb": memory.available / (1024 * 1024),
            "disk_percent": disk.percent,
            "disk_available_gb": disk.free / (1024 * 1024 * 1024),
        },
        "process": {
            "pid": os.getpid(),
        },
    }


@router.get("/health/readiness")
async def readiness_check():
    """Kubernetes readiness probe"""
    # Add checks for dependencies (DB, Redis, etc.)
    # For now, return healthy
    return Response(status_code=200, content="OK")


@router.get("/health/liveness")
async def liveness_check():
    """Kubernetes liveness probe"""
    return Response(status_code=200, content="OK")
