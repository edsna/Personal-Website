"""Chat request/response models"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime


class ChatMessage(BaseModel):
    """Single chat message"""
    role: str = Field(..., description="Message role (user/assistant/system)")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Chat API request"""
    message: str = Field(..., min_length=1, max_length=1000, description="User message")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")
    language: str = Field("en", description="Language (en/pt)")

    @field_validator('message')
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Validate message content"""
        if not v.strip():
            raise ValueError("Message cannot be empty")
        return v.strip()

    @field_validator('language')
    @classmethod
    def validate_language(cls, v: str) -> str:
        """Validate language"""
        if v not in ['en', 'pt']:
            raise ValueError("Language must be 'en' or 'pt'")
        return v


class ChatResponse(BaseModel):
    """Chat API response"""
    message: str = Field(..., description="Assistant response")
    conversation_id: str = Field(..., description="Conversation ID")
    tokens_used: int = Field(..., description="Tokens used in this request")
    tokens_remaining: int = Field(..., description="Tokens remaining for user")
    agent_used: Optional[str] = Field(None, description="Which agent handled the request")
    confidence: Optional[float] = Field(None, description="Confidence score (0-1)")
    is_on_topic: bool = Field(True, description="Whether question was on-topic")


class TokenUsage(BaseModel):
    """Token usage information"""
    ip_address: str
    tokens_used_today: int
    tokens_remaining: int
    requests_today: int
    last_request: datetime
    is_rate_limited: bool


class GuardrailViolation(BaseModel):
    """Guardrail violation information"""
    violation_type: str
    description: str
    severity: str  # low, medium, high
    timestamp: datetime
