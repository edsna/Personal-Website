"""Technical agent - handles questions about skills, technologies, and projects"""

import os
import structlog
from langchain.prompts import ChatPromptTemplate

from utils.llm_provider import get_llm

logger = structlog.get_logger()
TECHNICAL_DATA = """
## Core Technical Skills

### Generative AI & ML
- LLMs: OpenAI (GPT-4, GPT-3.5), Anthropic Claude, Apple Foundation Models, Llama 3.2, Mistral
- RAG Systems: LangChain, LangGraph, Vector Databases (Weaviate, Chroma)
- Multi-Agent Systems: LangGraph-based orchestration, supervisor patterns
- Fine-Tuning: Experience with model customization and training
- Frameworks: Transformers, PyTorch, Hugging Face

### Cloud & Infrastructure
- AWS: EKS, EC2, S3, Lambda, CloudFormation, SQS/SNS, DynamoDB, Route53, CloudWatch
- Kubernetes: Production-grade cluster management, Helm, ArgoCD, GitOps
- IaC: Terraform, CloudFormation
- Containers: Docker, Docker Compose

### DevOps & Automation
- CI/CD: GitHub Actions, GitLab CI, Jenkins
- Monitoring: Prometheus, Grafana, Datadog, CloudWatch
- Scripting: Python, Bash
- Tools: Git, ArgoCD, Helm Charts

### Software Development
- Languages: Python (expert), JavaScript, TypeScript, SQL
- Frameworks: FastAPI, Flask, React, Next.js, Streamlit, Gradio
- APIs: REST APIs, Microservices architecture
- Databases: PostgreSQL, MongoDB, Redis, Vector DBs

## Recent Certifications (2024-2025)
- Google Cloud: AI Infrastructure - Introduction to AI Hypercomputer!
- LangChain: Project: Deep Research with LangGraph
- DeepLearning.AI: Claude Code - Highly Agentic Coding Assistant
- Udacity: Foundations of Generative AI
- NVIDIA: Augment your LLM Using RAG
- DeepLearning.AI: ChatGPT Prompt Engineering, Finetuning LLMs, Multimodal Search and RAG
- IBM Cloud For The Enterprise

## Notable Projects

### AI Learning Hub LLC (2024-Present)
- Founded bilingual (English/Portuguese) AI education company
- Published "AI-Powered Content Creation & Automation" course on Udemy (5★ rating)
- Producing daily Portuguese-language AI content on LinkedIn
- Audience across 4 continents

### Enterprise RAG System (Arcaea)
- Architected LLM-powered platform with RAG using LangChain and Weaviate
- Improved content production efficiency by 20%
- Integrated with biotech R&D workflows

### Girls Can Code Club (Mozambique, 2020-2023)
- Founded remote coding education initiative during COVID-19
- Taught web development to 50+ young women
- Partnered with US Embassy Maputo

### Health Interoperability Platform
- FHIR-compliant web app for medical record sharing
- Used Smart-on-FHIR API and Firebase
- Enables patient-controlled data sharing
"""


class TechnicalAgent:
    """Agent specialized in technical skills and projects"""

    def __init__(self):
        try:
            self.llm = get_llm(temperature=0.3, max_tokens=300)
            if self.llm:
                logger.info("technical_agent_initialized")
            else:
                logger.warning("technical_agent_no_llm")
        except Exception as e:
            logger.error("technical_agent_init_failed", error=str(e))
            self.llm = None

    async def process(self, query: str, language: str = "en") -> str:
        """Process technical query"""

        if not self.llm:
            return self._fallback_response(language)

        try:
            system_prompt = f"""You are Edson's Minion, representing Edson Zandamela's technical expertise.
            Answer questions about his skills, technologies, tools, and projects.

            Technical Information:
            {TECHNICAL_DATA}

            Guidelines:
            - Be detailed about technical skills and experience
            - Mention specific technologies and versions when relevant
            - Highlight recent certifications and learning
            - Connect skills to real projects and achievements
            - Language: {"Portuguese" if language == "pt" else "English"}

            Keep responses concise (2-3 paragraphs max).
            """

            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("user", "{query}"),
            ])

            chain = prompt | self.llm
            response = await chain.ainvoke({"query": query})

            return response.content

        except Exception as e:
            logger.error("technical_agent_processing_failed", error=str(e))
            return self._fallback_response(language)

    def _fallback_response(self, language: str) -> str:
        if language == "pt":
            return """
            Edson tem forte experiência em GenAI e MLOps, incluindo:

            **IA Generativa**: LLMs (OpenAI, Claude, Llama), RAG, LangChain, LangGraph, Sistemas Multi-Agente

            **Cloud & Infraestrutura**: AWS (EKS, Lambda, S3), Kubernetes, Terraform, Docker

            **Desenvolvimento**: Python, FastAPI, JavaScript, React, Next.js

            Recentemente completou mais de 20 certificações em IA, incluindo cursos da DeepLearning.AI,
            Google Cloud, e NVIDIA.
            """
        else:
            return """
            Edson has strong expertise in GenAI and MLOps, including:

            **Generative AI**: LLMs (OpenAI, Claude, Llama), RAG, LangChain, LangGraph, Multi-Agent Systems

            **Cloud & Infrastructure**: AWS (EKS, Lambda, S3), Kubernetes, Terraform, Docker

            **Development**: Python, FastAPI, JavaScript, React, Next.js

            Recently completed 20+ AI certifications from DeepLearning.AI, Google Cloud, and NVIDIA.
            """
