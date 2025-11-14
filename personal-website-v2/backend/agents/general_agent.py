"""General agent - handles general questions about Edson"""

import os
import structlog
from utils.llm_provider import get_llm
from langchain.prompts import ChatPromptTemplate

logger = structlog.get_logger()

GENERAL_DATA = """
## About Edson Zandamela

**Current Title**: Senior AI Infrastructure Engineer / MLOps Engineer / GenAI Engineer

**Location**: Laurel, MD (willing to relocate)

**Contact Information**:
- Email: edsonaguiar17@gmail.com
- LinkedIn: linkedin.com/in/edsonzandamela
- GitHub: github.com/edsna
- Website: edsonzandamela.com

**Languages**: Fluent in English and Portuguese

**Background**:
Edson is from Mozambique and came to the United States for higher education at Trinity College.
He has since built a career in AI infrastructure and cloud engineering, working at both biotech
startups and big tech companies.

**Passion & Interests**:
- Intersection of AI, cloud infrastructure, and developer experience
- Education and mentorship (founded AI Learning Hub LLC and Girls Can Code Club)
- Bilingual AI content creation (English/Portuguese)
- Open source contributions
- Human-computer interaction and AI ethics

**Teaching & Community**:
- **AI Learning Hub LLC**: Founded bilingual AI education company creating practical GenAI courses
- **Girls Can Code Club**: Founded remote coding initiative teaching 50+ young women in Mozambique
- **Content Creator**: Daily Portuguese-language AI content on LinkedIn
- **US Embassy Partnership**: Partnered with US Embassy Maputo for STEM education

**Career Philosophy**:
Passionate about building developer-friendly automation and driving measurable business impact.
Believes in the power of AI to democratize access to technology and education globally.

**What Makes Edson Unique**:
- Bilingual (English/Portuguese) - reaches global audiences
- Combines deep technical expertise with business impact (saved $1.2M+ at Apple)
- Strong commitment to education and mentorship
- Experience across biotech, startups, and big tech
- Hands-on with latest GenAI technologies (LangChain, RAG, multi-agent systems)
"""


class GeneralAgent:
    """Agent for general questions about Edson"""

    def __init__(self):
        try:
            self.llm = get_llm(temperature=0.4, max_tokens=300)
            if self.llm:
                logger.info("general_agent_initialized")
            else:
                logger.warning("general_agent_no_llm")
        except Exception as e:
            logger.error("general_agent_init_failed", error=str(e))
            self.llm = None

    async def process(self, query: str, language: str = "en") -> str:
        """Process general query"""

        if not self.llm:
            return self._fallback_response(language)

        try:
            system_prompt = f"""You are Edson's Minion, a friendly AI assistant representing Edson Zandamela.
            Answer general questions about Edson - his background, interests, philosophy, and contact info.

            General Information:
            {GENERAL_DATA}

            Guidelines:
            - Be warm and personable while remaining professional
            - Emphasize Edson's unique combination of technical skills and teaching passion
            - Highlight his bilingual capabilities and global perspective
            - For contact questions, provide email and LinkedIn
            - Language: {"Portuguese" if language == "pt" else "English"}

            Keep responses conversational and concise (2-3 paragraphs max).
            """

            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("user", "{query}"),
            ])

            chain = prompt | self.llm
            response = await chain.ainvoke({"query": query})

            return response.content

        except Exception as e:
            logger.error("general_agent_processing_failed", error=str(e))
            return self._fallback_response(language)

    def _fallback_response(self, language: str) -> str:
        if language == "pt":
            return """
            Edson Zandamela é um Engenheiro Sênior de IA de Moçambique, atualmente trabalhando na
            Apple Inc. Ele é fluente em inglês e português.

            Edson é apaixonado por IA, infraestrutura em nuvem, e educação. Fundou a AI Learning Hub LLC
            para criar cursos de GenAI bilingues e a Girls Can Code Club para ensinar programação para
            jovens mulheres em Moçambique.

            Contato: edsonaguiar17@gmail.com | LinkedIn: linkedin.com/in/edsonzandamela
            """
        else:
            return """
            Edson Zandamela is a Senior AI Infrastructure Engineer from Mozambique, currently working
            at Apple Inc. He is fluent in both English and Portuguese.

            Edson is passionate about AI, cloud infrastructure, and education. He founded AI Learning Hub LLC
            to create bilingual GenAI courses and Girls Can Code Club to teach coding to 50+ young women
            in Mozambique.

            Contact: edsonaguiar17@gmail.com | LinkedIn: linkedin.com/in/edsonzandamela
            """
