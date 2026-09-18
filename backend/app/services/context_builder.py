from typing import List, Dict, Any
from app.models.document import Document

class SecureContextBuilder:
    """
    Builds the sanitized evidence package for the LLM.
    Strict Rule: Only pre-authorized, version-resolved documents are included.
    No unapproved text or denied documents can enter this pipeline.
    """

    @staticmethod
    def build_evidence_package(authorized_docs: List[Document]) -> List[Dict[str, Any]]:
        evidence_items = []
        for doc in authorized_docs:
            evidence_items.append({
                "document_id": doc.doc_id,
                "title": doc.title,
                "version": doc.version,
                "effective_date": doc.effective_date,
                "classification": doc.classification,
                "content": doc.content.strip(),
            })
        return evidence_items

    @classmethod
    def format_llm_prompt(cls, query: str, evidence_items: List[Dict[str, Any]]) -> str:
        if not evidence_items:
            return (
                "You are NexusGuard, the secure internal AI research assistant for Nova Solutions.\n\n"
                "CONTEXT: No authorized company documents were found matching the employee's query.\n\n"
                f"EMPLOYEE QUERY: {query}\n\n"
                "INSTRUCTION:\n"
                "State politely that you could not find sufficient accessible evidence in company records to answer this question. "
                "Suggest asking about information available to their department. "
                "DO NOT speculate or use outside knowledge."
            )

        evidence_text_blocks = []
        for item in evidence_items:
            evidence_text_blocks.append(
                f"--- DOCUMENT BEGIN ---\n"
                f"Document ID: {item['document_id']}\n"
                f"Title: {item['title']}\n"
                f"Version: {item['version']}\n"
                f"Effective Date: {item['effective_date']}\n"
                f"Classification: {item['classification']}\n"
                f"Content: {item['content']}\n"
                f"--- DOCUMENT END ---"
            )

        combined_evidence = "\n\n".join(evidence_text_blocks)

        prompt = (
            "You are NexusGuard, the secure internal AI research assistant for Nova Solutions.\n"
            "Answer the employee's question using ONLY the authorized company document evidence provided below.\n\n"
            "STRICT RULES:\n"
            "1. Base your answer solely on the provided authorized evidence. Do not extrapolate, speculate, or fabricate numbers.\n"
            "2. If the user asks for a specific fact (such as a forecast or policy) that is contained in the evidence, state the answer clearly and concisely.\n"
            "3. If multiple versions exist in the evidence, use the latest effective authorized version unless specifically asked to compare.\n"
            "4. Always cite the relevant Document ID (e.g. DOC-101, DOC-302) that supports your answer.\n"
            "5. If the evidence does not contain the answer, state that you could not find sufficient accessible evidence to answer that question.\n"
            "6. Never reveal or guess information outside the provided text.\n\n"
            f"AUTHORIZED EVIDENCE:\n{combined_evidence}\n\n"
            f"EMPLOYEE QUESTION: {query}\n\n"
            "ANSWER:"
        )
        return prompt
