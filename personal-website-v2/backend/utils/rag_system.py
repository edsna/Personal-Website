"""RAG (Retrieval-Augmented Generation) system with vector storage for dynamic knowledge retrieval"""

import os
import structlog
from typing import List, Dict, Any, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_community.embeddings import OllamaEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

logger = structlog.get_logger()

# Knowledge base about Edson Zandamela
KNOWLEDGE_BASE = [
    # Career Information
    {
        "content": """Edson Zandamela currently works at Apple Inc. as a Platform Infrastructure Engineer (Contractor via Advantis Global) since April 2025.
        He is based remotely in Cupertino, CA. At Apple, he optimizes GPU infrastructure for internal LLM workloads that power Siri, Maps, and core Apple services.
        He processes over 150,000 CloudWatch and CloudTrail events and has identified more than $1.2 million in annualized cost savings.
        He evaluates Apple Foundation Models (AFM) and emerging GenAI platforms. He remediates production ML security infrastructure and implements
        Infrastructure as Code (IaC) using Terraform and AWS best practices.""",
        "metadata": {"category": "career", "company": "Apple", "type": "current_role"}
    },
    {
        "content": """At Arcaea from August 2023 to March 2025, Edson worked as a DevOps Engineer in Boston, MA (remote).
        He architected an enterprise AI platform using LLMs and RAG systems that achieved 30% R&D efficiency improvement.
        He deployed scalable vector databases including Weaviate and Chroma with LangChain orchestration.
        He built cloud-native AI applications on AWS EKS achieving 99.9% uptime.
        He reduced cloud infrastructure costs by 90% through Kubernetes optimization.
        He implemented real-time monitoring and alerting with Prometheus and Grafana stack.
        He developed CI/CD pipelines for ML model deployment using GitHub Actions and ArgoCD.""",
        "metadata": {"category": "career", "company": "Arcaea", "type": "previous_role"}
    },
    {
        "content": """At Anagenex from August 2021 to August 2023, Edson worked as a Software Engineer IT & DevOps in Lexington, MA (hybrid).
        He designed Flask-based internal tools that reduced manual data tasks by 50%.
        He developed ML pipelines for drug discovery on AWS using SageMaker, Lambda, and Step Functions.
        He automated CI/CD workflows achieving 40% faster model evaluation cycles.
        He built production-grade AI solutions in collaboration with data science teams.
        He implemented data warehousing solutions using AWS Redshift and S3.
        He created Python automation scripts for biotech research workflows.""",
        "metadata": {"category": "career", "company": "Anagenex", "type": "previous_role"}
    },
    {
        "content": """At ZebiAI Therapeutics (acquired by Relay Therapeutics) from July 2020 to July 2021, Edson worked as a DevOps Associate in Waltham, MA (hybrid).
        He built Python/Flask microservices for scalable data ingestion pipelines.
        He successfully migrated 10TB+ datasets post-acquisition with 100% data integrity.
        He secured Azure environments with IAM policies and Microsoft Intune.
        He automated infrastructure provisioning using Terraform and ARM templates.
        He implemented monitoring solutions for biotech research applications.
        He collaborated with ML engineers on model deployment pipelines.""",
        "metadata": {"category": "career", "company": "ZebiAI", "type": "previous_role"}
    },
    {
        "content": """At Trinity College from September 2016 to May 2020, Edson worked as an IT Consultant (part-time) in Hartford, CT.
        He provided campus-wide technical support for students, faculty, and staff.
        He configured and maintained computer labs and classroom technology.
        He led network architecture training sessions for IT team members.
        He mentored junior staff on IT systems debugging and troubleshooting.
        He developed documentation for technical procedures and best practices.
        He supported over 2,000 users across multiple campus locations.""",
        "metadata": {"category": "career", "company": "Trinity College", "type": "previous_role"}
    },

    # Education
    {
        "content": """Edson holds three degrees:
        1. MSc in Computer Science with Machine Learning Specialization from Georgia Institute of Technology (May 2023)
        2. MSc in Information Technology focusing on Cloud Computing & Cybersecurity from University of The Cumberlands (August 2024)
        3. BSc in Computer Science & Psychology (Double Major) from Trinity College (May 2020)
        His graduate education focused on machine learning, deep learning, natural language processing, and cloud architecture.""",
        "metadata": {"category": "education", "type": "degrees"}
    },

    # Technical Skills
    {
        "content": """Edson's Generative AI and LLM skills include: OpenAI GPT-4/GPT-4o, Anthropic Claude, Meta Llama, Google Gemini, Mistral AI,
        RAG Systems, LangChain, LangGraph, LlamaIndex, Vector Databases (Weaviate, Chroma, Pinecone), Embeddings, Fine-Tuning,
        Prompt Engineering, Multi-Agent Systems, Semantic Search, and Hugging Face Transformers.
        He has extensive experience building production RAG systems that improved R&D efficiency by 30% and architecting multi-agent AI platforms.""",
        "metadata": {"category": "skills", "type": "genai"}
    },
    {
        "content": """Edson's Cloud and Infrastructure skills include: AWS (EC2, S3, Lambda, EKS, SageMaker, CloudWatch, CloudTrail),
        Azure (VMs, AKS, ML Studio, Intune), GCP (GKE, Vertex AI), Kubernetes, Terraform, CloudFormation, Docker, Helm, ArgoCD,
        Service Mesh (Istio), Load Balancing, Auto Scaling, VPC & Networking, and IAM & Security.
        He achieved 90% cloud cost reduction at Arcaea and $1.2M+ savings at Apple through infrastructure optimization.""",
        "metadata": {"category": "skills", "type": "cloud"}
    },
    {
        "content": """Edson's MLOps and Data skills include: MLflow, Kubeflow, SageMaker Pipelines, Airflow, DVC, Feature Stores,
        Model Monitoring, A/B Testing, Weaviate, Chroma, Pinecone, PostgreSQL, Redis, MongoDB, Snowflake, and dbt.
        He has built end-to-end ML pipelines for drug discovery and deployed scalable vector databases for enterprise AI platforms.""",
        "metadata": {"category": "skills", "type": "mlops"}
    },
    {
        "content": """Edson's Programming and Framework skills include: Python, JavaScript/TypeScript, Go, Bash/Shell, SQL,
        FastAPI, Flask, Django, React, Next.js, Node.js, GraphQL, REST APIs, and gRPC.
        He has built numerous internal tools, APIs, and full-stack applications for biotech and enterprise clients.""",
        "metadata": {"category": "skills", "type": "programming"}
    },

    # Certifications
    {
        "content": """Edson holds 15+ professional certifications including:
        AWS: Solutions Architect Associate, Developer Associate, SysOps Administrator Associate, Machine Learning Specialty, Security Specialty
        Kubernetes: Certified Kubernetes Administrator (CKA), Certified Kubernetes Application Developer (CKAD)
        Other Cloud: HashiCorp Terraform Associate, Google Cloud Professional ML Engineer, Microsoft Azure Administrator
        AI/ML: DeepLearning.AI TensorFlow Developer, LangChain for LLM Application Development
        Security: CompTIA Security+
        DevOps: GitHub Actions, Docker Certified Associate""",
        "metadata": {"category": "certifications", "type": "professional"}
    },

    # Achievements
    {
        "content": """Edson's key achievements include:
        - Identified $1.2M+ in annualized cost savings at Apple through GPU infrastructure optimization
        - Reduced cloud costs by 90% at Arcaea through Kubernetes optimization
        - Improved R&D efficiency by 30% with RAG systems implementation
        - Migrated 10TB+ datasets with 100% data integrity at ZebiAI
        - Achieved 99.9% uptime for cloud-native AI applications
        - Founded AI Learning Hub LLC for bilingual AI education
        - Founded Girls Can Code Club to teach coding to young girls in Mozambique""",
        "metadata": {"category": "achievements", "type": "highlights"}
    },

    # Consulting Services
    {
        "content": """Edson offers consulting services for Portuguese-speaking and English-speaking clients through AI Learning Hub LLC:
        1. GenAI Implementation: LLM integration, RAG systems, chatbot development, AI strategy - from $200/hour
        2. MLOps & Infrastructure: Kubernetes, cloud optimization, ML pipelines, monitoring - from $200/hour
        3. AI Training & Workshops: Team training on GenAI, LLMs, cloud, and MLOps - from $2,500/day

        He provides bilingual support (English/Portuguese) and specializes in biotech and enterprise AI solutions.
        Contact: edsonaguiar17@gmail.com or schedule via Calendly.""",
        "metadata": {"category": "consulting", "type": "services"}
    },

    # Personal
    {
        "content": """Edson Zandamela is fluent in both English and Portuguese. He is from Mozambique and founded Girls Can Code Club
        to teach coding to young girls in his home country. He also founded AI Learning Hub LLC to provide bilingual AI education.
        He is passionate about the intersection of AI, cloud infrastructure, and developer experience.
        He can be contacted at edsonaguiar17@gmail.com, LinkedIn: linkedin.com/in/edsonzandamela, GitHub: github.com/edsna.""",
        "metadata": {"category": "personal", "type": "background"}
    },
]


class RAGSystem:
    """RAG system for retrieving relevant information about Edson Zandamela"""

    def __init__(self, persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        self.embeddings = None
        self.vectorstore = None
        self._initialize()

    def _initialize(self):
        """Initialize embeddings and vector store"""
        try:
            # Try Ollama embeddings first
            ollama_base_url = os.getenv("OLLAMA_BASE_URL")
            if ollama_base_url:
                try:
                    self.embeddings = OllamaEmbeddings(
                        base_url=ollama_base_url,
                        model="nomic-embed-text"  # or "llama3.2:3b" for simple embeddings
                    )
                    logger.info("rag_ollama_embeddings_initialized")
                except Exception as e:
                    logger.warning("rag_ollama_embeddings_failed", error=str(e))

            # Fallback to OpenAI embeddings
            if not self.embeddings and os.getenv("OPENAI_API_KEY"):
                self.embeddings = OpenAIEmbeddings()
                logger.info("rag_openai_embeddings_initialized")

            if not self.embeddings:
                logger.warning("rag_no_embeddings_available")
                return

            # Initialize or load vector store
            self._setup_vectorstore()

        except Exception as e:
            logger.error("rag_initialization_failed", error=str(e))

    def _setup_vectorstore(self):
        """Setup the vector store with knowledge base"""
        try:
            # Check if vectorstore already exists
            if os.path.exists(self.persist_directory):
                self.vectorstore = Chroma(
                    persist_directory=self.persist_directory,
                    embedding_function=self.embeddings
                )
                logger.info("rag_vectorstore_loaded", path=self.persist_directory)
            else:
                # Create new vectorstore with knowledge base
                self._create_vectorstore()

        except Exception as e:
            logger.error("rag_vectorstore_setup_failed", error=str(e))
            # Try to create new if loading fails
            self._create_vectorstore()

    def _create_vectorstore(self):
        """Create vector store from knowledge base"""
        try:
            # Convert knowledge base to documents
            documents = []
            for item in KNOWLEDGE_BASE:
                doc = Document(
                    page_content=item["content"],
                    metadata=item["metadata"]
                )
                documents.append(doc)

            # Split documents for better retrieval
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=500,
                chunk_overlap=50,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            splits = text_splitter.split_documents(documents)

            # Create vector store
            self.vectorstore = Chroma.from_documents(
                documents=splits,
                embedding=self.embeddings,
                persist_directory=self.persist_directory
            )

            logger.info("rag_vectorstore_created", num_documents=len(splits))

        except Exception as e:
            logger.error("rag_vectorstore_creation_failed", error=str(e))

    def retrieve(self, query: str, k: int = 3, filter_category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve relevant documents for a query

        Args:
            query: The search query
            k: Number of results to return
            filter_category: Optional category filter (career, skills, education, etc.)

        Returns:
            List of relevant document contents with metadata
        """
        if not self.vectorstore:
            logger.warning("rag_retrieve_no_vectorstore")
            return []

        try:
            # Build filter if category specified
            search_kwargs = {"k": k}
            if filter_category:
                search_kwargs["filter"] = {"category": filter_category}

            # Perform similarity search
            results = self.vectorstore.similarity_search_with_score(
                query,
                **search_kwargs
            )

            # Format results
            formatted_results = []
            for doc, score in results:
                formatted_results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "relevance_score": 1 - score  # Convert distance to similarity
                })

            logger.info("rag_retrieve_success", query=query[:50], num_results=len(formatted_results))
            return formatted_results

        except Exception as e:
            logger.error("rag_retrieve_failed", error=str(e))
            return []

    def get_context_for_query(self, query: str, max_tokens: int = 1000) -> str:
        """Get formatted context string for a query

        Args:
            query: The user's question
            max_tokens: Approximate maximum tokens for context

        Returns:
            Formatted context string for LLM
        """
        results = self.retrieve(query, k=5)

        if not results:
            return ""

        # Build context string
        context_parts = []
        total_chars = 0
        char_limit = max_tokens * 4  # Approximate chars per token

        for result in results:
            content = result["content"]
            if total_chars + len(content) > char_limit:
                break
            context_parts.append(content)
            total_chars += len(content)

        return "\n\n".join(context_parts)

    def add_document(self, content: str, metadata: Dict[str, Any]) -> bool:
        """Add a new document to the knowledge base

        Args:
            content: Document content
            metadata: Document metadata

        Returns:
            True if successful
        """
        if not self.vectorstore:
            return False

        try:
            doc = Document(page_content=content, metadata=metadata)
            self.vectorstore.add_documents([doc])
            logger.info("rag_document_added", category=metadata.get("category"))
            return True
        except Exception as e:
            logger.error("rag_document_add_failed", error=str(e))
            return False


# Global RAG system instance
_rag_system: Optional[RAGSystem] = None

def get_rag_system() -> RAGSystem:
    """Get the global RAG system instance"""
    global _rag_system
    if _rag_system is None:
        _rag_system = RAGSystem()
    return _rag_system
