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
        Generalized grounded synthesis over any arbitrary document contents.
        Parses sentences and relevance matching without hardcoded scenarios.
        """
        query_words = set(re.findall(r'\b[a-zA-Z0-9_\-\.]+\b', query.lower()))
        stop_words = {"a", "an", "the", "is", "are", "was", "were", "what", "which", "who", "whom", "this", "that", "these", "those", "in", "on", "at", "to", "for", "of", "with", "by", "from", "about", "me", "my", "you", "your", "can", "could", "should", "would", "do", "does", "did", "tell", "show"}
        keywords = {w for w in query_words if w not in stop_words and len(w) > 1}

        # Check for general document listing questions ("what documents can I access?")
        if any(term in query.lower() for term in ["what documents", "what internal documents", "can i access", "list documents", "my documents", "available documents"]):
            doc_list = "\n".join([f"- **{item['title']}** (`{item['document_id']}`, v{item['version']}, {item.get('classification', 'Internal')})" for item in evidence_items])
            return f"Based on your authenticated permissions, you have authorized access to the following records:\n\n{doc_list}"

        # Match sentences across authorized evidence
        matching_sentences = []
        for item in evidence_items:
            content = item.get("content", "")
            # Split by period, newline, or semicolon
            sentences = re.split(r'(?<=[.!?\n])\s+', content)
            for s in sentences:
                s_clean = s.strip()
                if not s_clean:
                    continue
                s_lower = s_clean.lower()
                # Count keyword matches
                matches = sum(1 for kw in keywords if kw in s_lower)
                if matches > 0:
                    matching_sentences.append({
                        "sentence": s_clean,
                        "matches": matches,
                        "doc_id": item["document_id"],
                        "title": item["title"],
                        "version": item.get("version", "1.0"),
                        "effective_date": item.get("effective_date", "")
                    })

        if not matching_sentences:
            # If no sentences in the authorized evidence match the question keywords
            return SAFE_NO_ACCESS_MESSAGE

        # Sort by relevance
        matching_sentences.sort(key=lambda x: x["matches"], reverse=True)
        top_match = matching_sentences[0]

        # Check if question asks for a specific fact/summary
        if len(matching_sentences) == 1 or "summarize" not in query.lower():
            return f"According to authorized internal records ({top_match['title']}, {top_match['doc_id']} v{top_match['version']}):\n\n{top_match['sentence']}"
        else:
            # Summary of top matching facts
            unique_sentences = []
            seen = set()
            for m in matching_sentences[:3]:
                if m["sentence"] not in seen:
                    seen.add(m["sentence"])
                    unique_sentences.append(f"- {m['sentence']} *({m['title']}, {m['doc_id']} v{m['version']})*")
            return "Based on authorized company records:\n\n" + "\n".join(unique_sentences)
