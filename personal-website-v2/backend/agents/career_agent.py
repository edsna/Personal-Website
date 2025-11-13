"""Career agent - handles questions about work experience and roles"""

import os
import structlog
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

logger = structlog.get_logger()

# Edson's career data
CAREER_DATA = """
## Current Role
**Apple Inc. - Platform Infrastructure Engineer (Contractor via Advantis Global)**
- Apr 2025 - Present
- Location: Cupertino, CA (Remote)
- Optimized GPU infrastructure for Apple's internal LLM workloads (Siri, Maps, core services)
- Processed 150K+ CloudWatch/CloudTrail events identifying $1.2M+ in annualized cost savings
- Evaluated Apple Foundation Models (AFM) and GenAI platforms
- Remediated production ML security infrastructure
- Implemented IaC using Terraform and AWS services

## Previous Roles

**Arcaea - DevOps Engineer**
- Aug 2023 - Mar 2025
- Location: Boston, MA (Remote)
- Architected enterprise AI platform using LLMs and RAG (20% efficiency improvement)
- Deployed scalable vector databases (Weaviate/Chroma) with LangChain
- Built cloud-native AI applications on AWS EKS (99.9% uptime, 90% cost reduction)
- Implemented real-time monitoring with Prometheus/Grafana

**Anagenex - Software Engineer IT & DevOps**
- Aug 2021 - Aug 2023
- Location: Lexington, MA (Hybrid)
- Designed Flask-based internal tools (50% reduction in manual tasks)
- Developed ML pipelines for drug discovery on AWS
- Automated CI/CD workflows (40% faster model evaluation)
- Collaborated with data scientists on production-grade AI solutions

**ZebiAI Therapeutics (acquired by Relay) - DevOps Associate**
- Jul 2020 - Jul 2021
- Location: Waltham, MA (Hybrid)
- Built Python/Flask microservices for data ingestion pipelines
- Migrated 10TB+ datasets post-acquisition with 100% integrity
- Secured Azure environments with IAM policies and Intune

**Trinity College - IT Consultant**
- Sep 2016 - May 2020
- Location: Hartford, CT (On-site)
- Provided campus-wide technical support
- Configured computer labs and classroom technology
- Led network architecture training sessions
- Mentored trainees on IT systems debugging

## Education
- **MSc in Computer Science (ML Specialization)** - Georgia Institute of Technology (May 2023)
- **MSc in Information Technology** - University of The Cumberlands (Aug 2024)
- **BSc in Computer Science & Psychology (Double Major)** - Trinity College (May 2020)

## Notable Achievements
- Saved $1.2M+ annually at Apple through GPU infrastructure optimization
- Reduced cloud costs by 90% at Arcaea
- Improved R&D efficiency by 30% with RAG systems
- Founded AI Learning Hub LLC (bilingual AI education)
- Founded Girls Can Code Club (coding education in Mozambique)
"""


class CareerAgent:
    """Agent specialized in answering career-related questions"""

    def __init__(self):
        self.llm = None
        api_key = os.getenv("OPENAI_API_KEY")

        if api_key:
            try:
                self.llm = ChatOpenAI(
                    model="gpt-3.5-turbo",
                    temperature=0.3,
                    max_tokens=300,
                )
                logger.info("career_agent_initialized")
            except Exception as e:
                logger.error("career_agent_init_failed", error=str(e))
                self.llm = None
        else:
            logger.warning("no_openai_key_for_career_agent")

    async def process(self, query: str, language: str = "en") -> str:
        """Process career-related query"""

        if not self.llm:
            return self._fallback_response(language)

        try:
            system_prompt = f"""You are Edson's Minion, an AI assistant representing Edson Zandamela.
            Answer questions about Edson's career, work experience, and professional background.

            Use this career information:
            {CAREER_DATA}

            Guidelines:
            - Be professional but friendly
            - Provide specific details from the career data
            - Highlight achievements and impact
            - If asked about current role, emphasize work at Apple
            - Language: {"Portuguese" if language == "pt" else "English"}

            Keep responses concise (2-3 paragraphs max).
            """

            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("user", "{query}"),
            ])

            chain = prompt | self.llm
            response = await chain.ainvoke({"query": query})

            logger.info("career_query_processed", query=query[:100])

            return response.content

        except Exception as e:
            logger.error("career_agent_processing_failed", error=str(e))
            return self._fallback_response(language)

    def _fallback_response(self, language: str) -> str:
        """Fallback response when LLM is unavailable"""
        if language == "pt":
            return """
            Edson Zandamela é um Engenheiro Sênior de Infraestrutura de IA com mais de 5 anos de experiência.

            Atualmente trabalha na Apple Inc. (via Advantis Global) otimizando infraestrutura GPU para
            cargas de trabalho LLM, economizando mais de $1.2M anualmente.

            Previamente na Arcaea, ele arquitetou plataformas de IA empresariais com sistemas RAG,
            melhorando a eficiência de P&D em 30% e reduzindo custos de nuvem em 90%.

            Educação: Mestrado em Ciência da Computação (especialização em ML) - Georgia Tech.
            """
        else:
            return """
            Edson Zandamela is a Senior AI Infrastructure Engineer with 5+ years of experience.

            Currently at Apple Inc. (via Advantis Global), he optimizes GPU infrastructure for
            LLM workloads, saving $1.2M+ annually.

            Previously at Arcaea, he architected enterprise AI platforms with RAG systems,
            improving R&D efficiency by 30% and reducing cloud costs by 90%.

            Education: MSc in Computer Science (ML Specialization) - Georgia Tech.
            """
