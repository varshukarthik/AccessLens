import re
from typing import List, Dict, Any
from app.schemas.research import CitationItem

class CitationValidator:
    """
    Validates all generated citations against the pre-approved authorized document set.
    Strictly discards or blocks any citation not in the authorized document list.
    """

    @staticmethod
    def validate_citations(
        answer: str,
        authorized_evidence: List[Dict[str, Any]]
    ) -> List[CitationItem]:
        if not authorized_evidence:
            return []

        authorized_by_id = {item["document_id"].upper(): item for item in authorized_evidence}
        
        # Check if specific doc IDs are cited in the answer
        cited_ids = set(re.findall(r'DOC-[0-9]+', answer, re.IGNORECASE))
        cited_ids_upper = {cid.upper() for cid in cited_ids}

        validated_citations: List[CitationItem] = []

        # If specific authorized IDs were cited, include them
        for cid in cited_ids_upper:
            if cid in authorized_by_id:
                doc = authorized_by_id[cid]
                # Excerpt first 150 chars
                excerpt = doc.get("content", "")[:150] + "..." if len(doc.get("content", "")) > 150 else doc.get("content", "")
                validated_citations.append(CitationItem(
                    document_id=doc["document_id"],
                    title=doc["title"],
                    version=doc["version"],
                    effective_date=doc["effective_date"],
                    classification=doc.get("classification"),
                    excerpt=excerpt
                ))

        # If the LLM answer did not explicitly print the DOC-ID token, but authorized evidence was used,
        # attach the primary authorized documents that formed the context
        if not validated_citations and authorized_evidence:
            for doc in authorized_evidence:
                excerpt = doc.get("content", "")[:150] + "..." if len(doc.get("content", "")) > 150 else doc.get("content", "")
                validated_citations.append(CitationItem(
                    document_id=doc["document_id"],
                    title=doc["title"],
                    version=doc["version"],
                    effective_date=doc["effective_date"],
                    classification=doc.get("classification"),
                    excerpt=excerpt
                ))

        return validated_citations
