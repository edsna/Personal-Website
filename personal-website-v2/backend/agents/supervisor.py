"""Supervisor agent that routes queries to specialized agents"""

import os
import uuid
import structlog
from typing import Optional, Dict, Any
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel

from .career_agent import CareerAgent
from .technical_agent import TechnicalAgent
from .general_agent import GeneralAgent

logger = structlog.get_logger()


class AgentResponse(BaseModel):
    """Response from an agent"""
    message: str
    conversation_id: str
    tokens_used: int
    agent_used: str
    confidence: float


class SupervisorAgent:
    """
    Supervisor agent that routes queries to specialized agents

    Agents:
    - CareerAgent: Handles questions about work experience, roles, companies
    - TechnicalAgent: Handles questions about skills, technologies, projects
    - GeneralAgent: Handles general questions about Edson
    """

    def __init__(self):
        self.llm = None
        api_key = os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")

        if api_key:
            try:
                # Initialize routing LLM
                self.llm = ChatOpenAI(
                    model="gpt-3.5-turbo",
                    temperature=0.0,
                    max_tokens=50,
                )

                # Initialize specialized agents
                self.career_agent = CareerAgent()
                self.technical_agent = TechnicalAgent()
                self.general_agent = GeneralAgent()

                logger.info("supervisor_agent_initialized")

            except Exception as e:
                logger.error("supervisor_init_failed", error=str(e))
                self.llm = None
        else:
            logger.warning("no_api_key_found_for_supervisor")
            self.llm = None

    async def route_query(self, query: str) -> str:
        """
        Determine which agent should handle the query

        Returns: "career" | "technical" | "general"
        """
        if not self.llm:
            return "general"

        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are a routing agent. Determine which agent should handle the user's question:

                - career: Questions about work experience, job roles, companies, positions
                - technical: Questions about skills, technologies, programming languages, tools, projects
                - general: General questions about education, background, contact info, interests

                Respond with ONLY one word: career, technical, or general"""),
                ("user", "{query}"),
            ])

            chain = prompt | self.llm
            response = await chain.ainvoke({"query": query})

            route = response.content.strip().lower()

            if route not in ["career", "technical", "general"]:
                route = "general"

            logger.info(
                "query_routed",
                query=query[:100],
                route=route,
            )

            return route

        except Exception as e:
            logger.error("routing_failed", error=str(e))
            return "general"

    async def process_query(
        self,
        query: str,
        conversation_id: Optional[str] = None,
        language: str = "en",
    ) -> AgentResponse:
        """
        Process a query through the multi-agent system

        1. Route to appropriate agent
        2. Agent processes query
        3. Return response
        """
        # Generate conversation ID if not provided
        if not conversation_id:
            conversation_id = str(uuid.uuid4())

        # If no LLM configured, return fallback response
        if not self.llm:
            return await self._fallback_response(query, conversation_id, language)

        try:
            # Route query to appropriate agent
            route = await self.route_query(query)

            # Process with selected agent
            if route == "career":
                response = await self.career_agent.process(query, language)
                agent_used = "career_agent"
            elif route == "technical":
                response = await self.technical_agent.process(query, language)
                agent_used = "technical_agent"
            else:
                response = await self.general_agent.process(query, language)
                agent_used = "general_agent"

            # Estimate tokens (rough approximation)
            tokens_used = len(query.split()) + len(response.split())

            return AgentResponse(
                message=response,
                conversation_id=conversation_id,
                tokens_used=tokens_used,
                agent_used=agent_used,
                confidence=0.85,
            )

        except Exception as e:
            logger.error(
                "query_processing_failed",
                error=str(e),
                exc_info=True,
            )

            return await self._fallback_response(query, conversation_id, language)

    async def _fallback_response(
        self,
        query: str,
        conversation_id: str,
        language: str,
    ) -> AgentResponse:
        """Fallback response when agents are unavailable"""
        if language == "pt":
            message = (
                "Desculpe, não consigo processar sua pergunta no momento. "
                "Por favor, envie um e-mail para edsonaguiar17@gmail.com ou "
                "conecte-se no LinkedIn."
            )
        else:
            message = (
                "I'm currently unable to process your question. "
                "Please reach out via email at edsonaguiar17@gmail.com or "
                "connect on LinkedIn."
            )

        return AgentResponse(
            message=message,
            conversation_id=conversation_id,
            tokens_used=10,
            agent_used="fallback",
            confidence=1.0,
        )
