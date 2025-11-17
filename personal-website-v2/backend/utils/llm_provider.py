"""LLM provider utility - supports both OpenAI and Ollama"""

import os
import structlog
from typing import Optional
from langchain_community.llms import Ollama
from langchain_community.chat_models import ChatOllama
from langchain_openai import ChatOpenAI

logger = structlog.get_logger()

def get_llm(
    temperature: float = 0.3,
    max_tokens: int = 300,
    model_name: Optional[str] = None
):
    """
    Get LLM instance based on environment configuration

    Supports:
    - Ollama (self-hosted via OLLAMA_BASE_URL)
    - OpenAI-compatible APIs (via OPENAI_BASE_URL, e.g., Open-World API)
    - OpenAI (standard API)
    - Anthropic (API)
    """

    # Check for Ollama configuration first (preferred for self-hosted)
    ollama_base_url = os.getenv("OLLAMA_BASE_URL")
    ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")

    if ollama_base_url:
        try:
            logger.info(
                "initializing_ollama_llm",
                base_url=ollama_base_url,
                model=ollama_model,
            )

            return ChatOllama(
                base_url=ollama_base_url,
                model=model_name or ollama_model,
                temperature=temperature,
                num_predict=max_tokens,  # Ollama uses num_predict instead of max_tokens
            )
        except Exception as e:
            logger.error("ollama_init_failed", error=str(e))
            # Fall through to OpenAI/Anthropic

    # Check for OpenAI or OpenAI-compatible API (e.g., Open-World)
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        try:
            # Support custom base URL for OpenAI-compatible APIs
            openai_base_url = os.getenv("OPENAI_BASE_URL")
            openai_model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

            kwargs = {
                "model": model_name or openai_model,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }

            # Add base_url if custom endpoint is specified
            if openai_base_url:
                kwargs["base_url"] = openai_base_url
                logger.info(
                    "initializing_openai_compatible_llm",
                    base_url=openai_base_url,
                    model=kwargs["model"],
                )
            else:
                logger.info("initializing_openai_llm", model=kwargs["model"])

            return ChatOpenAI(**kwargs)
        except Exception as e:
            logger.error("openai_init_failed", error=str(e))

    # If nothing configured, return None
    logger.warning("no_llm_provider_configured")
    return None


def get_classifier_llm():
    """
    Get a small, fast LLM for classification tasks
    Uses phi3:mini for Ollama, tinyllama for Open-World, or gpt-3.5-turbo for OpenAI
    """
    ollama_base_url = os.getenv("OLLAMA_BASE_URL")
    classifier_model = os.getenv("OLLAMA_CLASSIFIER_MODEL", "phi3:mini")

    if ollama_base_url:
        try:
            logger.info(
                "initializing_classifier_llm",
                provider="ollama",
                model=classifier_model,
            )
            return ChatOllama(
                base_url=ollama_base_url,
                model=classifier_model,
                temperature=0.0,
                num_predict=10,  # Very short responses for yes/no
            )
        except Exception as e:
            logger.error("classifier_ollama_init_failed", error=str(e))

    # Fallback to OpenAI or OpenAI-compatible API
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        openai_base_url = os.getenv("OPENAI_BASE_URL")
        classifier_model = os.getenv("OPENAI_CLASSIFIER_MODEL", "gpt-3.5-turbo")

        kwargs = {
            "model": classifier_model,
            "temperature": 0.0,
            "max_tokens": 10,
        }

        if openai_base_url:
            kwargs["base_url"] = openai_base_url
            logger.info(
                "initializing_classifier_llm",
                provider="openai_compatible",
                base_url=openai_base_url,
                model=classifier_model,
            )
        else:
            logger.info("initializing_classifier_llm", provider="openai", model=classifier_model)

        return ChatOpenAI(**kwargs)

    return None
