import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.document import Document

class DocumentRetriever:
    """
    Retriever for internal corporate knowledge.
    Finds candidates based on keyword matching and relevance scoring.
    IMPORTANT: Candidate retrieval does NOT imply authorization.
    All candidates must pass the Deterministic Authorization Gate.
    """

    @staticmethod
    def _tokenize(text: str) -> set:
        if not text:
            return set()
        words = re.findall(r'\b[a-zA-Z0-9_\-\.]+\b', text.lower())
        # Filter basic stop words
        stop_words = {"a", "an", "the", "is", "are", "was", "were", "what", "which", "who", "whom", "this", "that", "these", "those", "in", "on", "at", "to", "for", "of", "with", "by", "from", "about", "me", "my", "you", "your", "can", "could", "should", "would", "do", "does", "did"}
        return {w for w in words if w not in stop_words and len(w) > 1}

    @classmethod
    def retrieve_candidates(cls, db: Session, query: str, top_k: int = 10) -> List[Document]:
        """
        Retrieves top candidate documents matching the query.
        Returns Document models (raw candidates).
        """
        query_tokens = cls._tokenize(query)
        if not query_tokens:
            # Fallback: return active searchable documents
            return db.query(Document).filter(Document.is_searchable == True, Document.status == "ACTIVE").limit(top_k).all()

        all_docs = db.query(Document).filter(Document.is_searchable == True, Document.status != "DRAFT").all()
        scored_docs = []

        query_lower = query.lower()

        for doc in all_docs:
            score = 0.0
            doc_id_lower = doc.doc_id.lower()
            title_lower = doc.title.lower()
            content_lower = doc.content.lower()
            lineage_lower = (doc.lineage_group or "").lower()

            # Exact doc_id reference in query gives immediate high score
            if doc_id_lower in query_lower:
                score += 50.0

            # Title direct substring match
            if title_lower in query_lower or query_lower in title_lower:
                score += 30.0

            # Lineage group matching
            if lineage_lower and (lineage_lower in query_lower or any(tok in lineage_lower for tok in query_tokens)):
                score += 20.0

            # Token overlap scoring
            title_tokens = cls._tokenize(doc.title)
            content_tokens = cls._tokenize(doc.content)

            title_matches = query_tokens.intersection(title_tokens)
            content_matches = query_tokens.intersection(content_tokens)

            score += len(title_matches) * 15.0
            score += len(content_matches) * 5.0

            # Boost for phrase matching
            for token in query_tokens:
                if token in title_lower:
                    score += 5.0
                if token in content_lower:
                    score += 2.0

            if score > 0:
                scored_docs.append((score, doc))

        if not scored_docs:
            return []

        # Sort by score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        top_score = scored_docs[0][0]

        # Filter candidates: must have meaningful relative relevance to the top match
        # (e.g. at least 45% of top candidate score or >= 25.0)
        threshold = max(20.0, top_score * 0.45)
        filtered = [doc for score, doc in scored_docs if score >= threshold]
        
        return filtered[:top_k]
