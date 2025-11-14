"""Chat API endpoints"""

from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
import structlog
import uuid
from datetime import datetime

from models.chat import ChatRequest, ChatResponse, TokenUsage
from guardrails.rate_limiter import RateLimiter, get_client_ip
from guardrails.content_filter import ContentFilter
from agents.supervisor import SupervisorAgent

logger = structlog.get_logger()

router = APIRouter()

# Initialize components
rate_limiter = RateLimiter()
content_filter = ContentFilter()
supervisor_agent = SupervisorAgent()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    http_request: Request,
):
    """
    Chat with Edson's Minion - Multi-agent RAG chatbot

    Guardrails:
    - Rate limiting: 3 requests/minute, 50 tokens/day per IP
    - Content filtering: Only answers questions about Edson
    - Input validation: Max 1000 characters
    - Topic classification: Ensures on-topic questions
    """
    client_ip = get_client_ip(http_request)

    try:
        # 1. Rate Limiting Check
        is_allowed, tokens_remaining, reason = await rate_limiter.check_rate_limit(client_ip)

        if not is_allowed:
            logger.warning(
                "rate_limit_exceeded",
                ip=client_ip,
                reason=reason,
            )
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded: {reason}",
            )

        # 2. Content Filtering - Input Validation
        is_valid, validation_reason = await content_filter.validate_input(request.message)

        if not is_valid:
            logger.warning(
                "content_filter_blocked",
                ip=client_ip,
                reason=validation_reason,
            )
            raise HTTPException(
                status_code=400,
                detail=f"Invalid input: {validation_reason}",
            )

        # 3. Topic Classification
        is_on_topic = await content_filter.is_on_topic(request.message)

        if not is_on_topic:
            # Politely decline off-topic questions
            response_message = (
                "I'm Edson's Minion, and I can only answer questions about Edson Zandamela's "
                "professional experience, skills, and projects. Please ask me something about Edson!"
            )

            if request.language == "pt":
                response_message = (
                    "Sou o Minion do Edson e só posso responder perguntas sobre a experiência "
                    "profissional, habilidades e projetos do Edson Zandamela. Por favor, "
                    "pergunte-me algo sobre o Edson!"
                )

            return ChatResponse(
                message=response_message,
                conversation_id=request.conversation_id or str(uuid.uuid4()),
                tokens_used=0,
                tokens_remaining=tokens_remaining,
                agent_used="content_filter",
                confidence=1.0,
                is_on_topic=False,
            )

        # 4. Process with Multi-Agent System
        logger.info(
            "processing_chat_request",
            ip=client_ip,
            language=request.language,
            message_length=len(request.message),
        )

        agent_response = await supervisor_agent.process_query(
            query=request.message,
            conversation_id=request.conversation_id,
            language=request.language,
        )

        # 5. Update Rate Limiter
        await rate_limiter.record_usage(client_ip, agent_response.tokens_used)

        # 6. Content Filtering - Output Validation
        is_safe, safety_reason = await content_filter.validate_output(agent_response.message)

        if not is_safe:
            logger.error(
                "unsafe_output_detected",
                reason=safety_reason,
            )
            raise HTTPException(
                status_code=500,
                detail="Unable to process request safely",
            )

        # 7. Return Response
        logger.info(
            "chat_request_completed",
            ip=client_ip,
            tokens_used=agent_response.tokens_used,
            agent_used=agent_response.agent_used,
        )

        return ChatResponse(
            message=agent_response.message,
            conversation_id=agent_response.conversation_id,
            tokens_used=agent_response.tokens_used,
            tokens_remaining=tokens_remaining - agent_response.tokens_used,
            agent_used=agent_response.agent_used,
            confidence=agent_response.confidence,
            is_on_topic=True,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "chat_request_failed",
            ip=client_ip,
            error=str(e),
            exc_info=True,
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request",
        )


@router.get("/chat/usage", response_model=TokenUsage)
async def get_usage(http_request: Request):
    """Get current token usage for the requesting IP"""
    client_ip = get_client_ip(http_request)

    usage = await rate_limiter.get_usage(client_ip)

    return TokenUsage(
        ip_address=client_ip,
        tokens_used_today=usage["tokens_used"],
        tokens_remaining=usage["tokens_remaining"],
        requests_today=usage["requests_today"],
        last_request=usage.get("last_request") or datetime.now(),
        is_rate_limited=usage["is_rate_limited"],
    )


@router.post("/chat/reset-usage")
async def reset_usage(http_request: Request):
    """Reset token usage (for testing only - should be protected in production)"""
    client_ip = get_client_ip(http_request)

    await rate_limiter.reset_usage(client_ip)

    return {"message": f"Usage reset for IP: {client_ip}"}
