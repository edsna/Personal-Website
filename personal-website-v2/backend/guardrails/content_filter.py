"""Content filtering and topic classification for chatbot"""

import re
from typing import Tuple
import structlog
from utils.llm_provider import get_classifier_llm
from langchain.prompts import ChatPromptTemplate
import os

logger = structlog.get_logger()

# Keywords related to Edson
EDSON_KEYWORDS = [
    "edson", "zandamela", "experience", "work", "job", "career", "skills",
    "education", "apple", "arcaea", "anagenex", "trinity", "georgia tech",
    "ai", "genai", "mlops", "devops", "kubernetes", "aws", "python",
    "langchain", "rag", "llm", "machine learning", "infrastructure",
    "resume", "cv", "contact", "email", "linkedin", "github",
    "mozambique", "portuguese", "bilingual", "girls can code",
]

# Malicious patterns to block
MALICIOUS_PATTERNS = [
    r"<script",  # XSS
    r"javascript:",  # XSS
    r"onerror\s*=",  # XSS
    r"onload\s*=",  # XSS
    r"(union\s+select|drop\s+table|insert\s+into)",  # SQL injection
    r"\.\.\/",  # Path traversal
    r"exec\s*\(",  # Code injection
    r"eval\s*\(",  # Code injection
]


class ContentFilter:
    """Content filtering and topic classification"""

    def __init__(self):
        try:
            self.llm = get_classifier_llm()
            if self.llm:
                logger.info("content_filter_initialized")
            else:
                logger.warning("content_filter_no_llm")
        except Exception as e:
            logger.warning("llm_init_failed", error=str(e))
            self.llm = None

    async def validate_input(self, text: str) -> Tuple[bool, str]:
        """
        Validate user input for malicious content

        Returns:
            (is_valid, reason)
        """
        # Check for malicious patterns
        for pattern in MALICIOUS_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                logger.warning(
                    "malicious_pattern_detected",
                    pattern=pattern,
                    text=text[:100],
                )
                return False, "Potential security issue detected"

        # Check length
        if len(text) > 1000:
            return False, "Message too long"

        # Check for excessive special characters (potential obfuscation)
        special_char_ratio = sum(1 for c in text if not c.isalnum() and not c.isspace()) / len(text)
        if special_char_ratio > 0.5:
            return False, "Too many special characters"

        return True, "OK"

    async def is_on_topic(self, text: str) -> bool:
        """
        Check if the question is about Edson

        Uses keyword matching first, then LLM classification if available
        """
        text_lower = text.lower()

        # Quick keyword check
        has_edson_keyword = any(keyword in text_lower for keyword in EDSON_KEYWORDS)

        if has_edson_keyword:
            # Likely on-topic
            return True

        # If no keywords found, use LLM for more accurate classification
        if self.llm:
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", """You are a topic classifier. Determine if the following question
                    is about Edson Zandamela's professional experience, skills, education, or projects.

                    Answer ONLY with 'yes' or 'no'."""),
                    ("user", "{question}"),
                ])

                chain = prompt | self.llm
                response = await chain.ainvoke({"question": text})

                result = response.content.strip().lower()

                logger.info(
                    "topic_classification",
                    question=text[:100],
                    result=result,
                )

                return result == "yes"

            except Exception as e:
                logger.error("topic_classification_failed", error=str(e))
                # Fail closed - if no keywords and LLM fails, consider off-topic
                return False

        # If no LLM available and no keywords, consider off-topic
        return False

    async def validate_output(self, text: str) -> Tuple[bool, str]:
        """
        Validate assistant output for safety

        Returns:
            (is_safe, reason)
        """
        # Check for potential PII leakage (phone numbers, SSN, etc.)
        phone_pattern = r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b"
        ssn_pattern = r"\b\d{3}-\d{2}-\d{4}\b"
        credit_card_pattern = r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b"

        if re.search(phone_pattern, text):
            logger.warning("potential_phone_number_in_output")
            # This is actually okay if it's Edson's contact info
            # return False, "PII detected"

        if re.search(ssn_pattern, text):
            logger.error("ssn_detected_in_output")
            return False, "Sensitive data detected"

        if re.search(credit_card_pattern, text):
            logger.error("credit_card_detected_in_output")
            return False, "Sensitive data detected"

        # Check for malicious content in output
        for pattern in MALICIOUS_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                logger.error("malicious_content_in_output", pattern=pattern)
                return False, "Unsafe content detected"

        return True, "OK"

    async def detect_jailbreak(self, text: str) -> bool:
        """
        Detect potential jailbreak attempts

        Common jailbreak patterns:
        - "Ignore previous instructions"
        - "You are now..."
        - "Forget your rules"
        - "As a different AI..."
        """
        jailbreak_patterns = [
            r"ignore\s+(previous|all|your)\s+instructions",
            r"forget\s+(your|the)\s+(rules|instructions|guidelines)",
            r"you\s+are\s+now\s+(a|an)",
            r"act\s+as\s+(a|an)\s+(?!edson)",
            r"pretend\s+to\s+be",
            r"system\s*:\s*",
            r"disregard\s+(previous|your)",
        ]

        for pattern in jailbreak_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                logger.warning(
                    "jailbreak_attempt_detected",
                    pattern=pattern,
                    text=text[:100],
                )
                return True

        return False
