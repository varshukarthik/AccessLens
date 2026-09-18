import re
import os
from typing import List, Dict, Any, Optional
from app.core.config import settings

SAFE_NO_ACCESS_MESSAGE = "I couldn't find sufficient accessible evidence in company records to answer that question. Try asking about information available to your department or role."

class AnswerGenerator:
    """
    Synthesizes grounded answers strictly from authorized evidence.
    General architecture supporting Gemini, OpenAI, or a generalized local grounded synthesis engine.
    Contains zero hardcoded employee names or scripted outputs.
    """

    @classmethod
    async def generate_answer(
        cls, 
        query: str, 
        evidence_items: List[Dict[str, Any]], 
        prompt: str
    ) -> str:
        if not evidence_items:
            return SAFE_NO_ACCESS_MESSAGE

        # 1. Check if Gemini API key is configured
        if (settings.LLM_PROVIDER in ["auto", "gemini"]) and settings.GEMINI_API_KEY:
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"[AnswerGenerator] Gemini API error, falling back to local synthesizer: {e}")

        # 2. Check if OpenAI API key is configured
        if (settings.LLM_PROVIDER in ["auto", "openai"]) and settings.OPENAI_API_KEY:
            try:
                import openai
                client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                res = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are NexusGuard, the secure internal AI research assistant for Nova Solutions. Synthesize grounded answers strictly from the provided authorized evidence without speculation."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.0
                )
                if res.choices and res.choices[0].message.content:
                    return res.choices[0].message.content.strip()
            except Exception as e:
                print(f"[AnswerGenerator] OpenAI API error, falling back to local synthesizer: {e}")

        # 3. Generalized Grounded Local Synthesizer
        return cls._generalized_grounded_synthesis(query, evidence_items)

    @classmethod
    def _generalized_grounded_synthesis(cls, query: str, evidence_items: List[Dict[str, Any]]) -> str:
        """
        Generalized grounded synthesis powered by composer.py.
        Provides token overlap scoring, numeric boost, header penalty, version conflicts, and citations.
        """
        from app.services.composer import compose_grounded_answer
        return compose_grounded_answer(query, evidence_items)

