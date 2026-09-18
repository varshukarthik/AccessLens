"""
Embedding-based document retriever for NexusGuard.

Uses cosine similarity with a local feature-hashing embedder (no external API).
Only returns documents with score >= MIN_SCORE (0.20) AND >= 55% of the best score.

This prevents irrelevant queries ("What is my PAN?") from retrieving arbitrary documents.
Ported from p14-aegis retrieval.py logic.

IMPORTANT: Candidate retrieval does NOT imply authorization.
All candidates must pass the Deterministic Authorization Gate.
"""
from __future__ import annotations

import re
from typing import List

from sqlalchemy.orm import Session
from app.models.document import Document
from app.services.embeddings import embed, cosine, tokenize

# Minimum absolute similarity score for a document to be considered a candidate.
# Below this: the query has no meaningful overlap with the document.
MIN_SCORE = 0.20

# Minimum relative score as fraction of best candidate's score.
RELATIVE_FLOOR = 0.55


def _title_overlap(q_tokens: list[str], title: str) -> float:
    """Fraction of query tokens that appear in the title."""
    if not q_tokens:
        return 0.0
    tt = set(tokenize(title, expand=False))
    return len(set(q_tokens) & tt) / max(len(q_tokens), 1)


class DocumentRetriever:
    """
    Retriever for internal corporate knowledge.
    Uses embedding-based cosine similarity with a strict relevance threshold.

    IMPORTANT: Candidate retrieval does NOT imply authorization.
    All candidates must pass the Deterministic Authorization Gate.
    """

    @classmethod
    def retrieve_candidates(cls, db: Session, query: str, top_k: int = 8) -> List[Document]:
        """
        Retrieves top candidate documents matching the query using embedding similarity.

        Returns Document models (raw candidates). Returns [] when no documents are
        sufficiently relevant to the query (prevents hallucination from unrelated docs).
        """
        if not query or not query.strip():
            return []

        # Compute query embedding
        qvec = embed(query)
        q_tokens = tokenize(query)

        # Fetch all searchable, non-draft documents
        all_docs = db.query(Document).filter(
            Document.is_searchable == True,
            Document.status != "DRAFT"
        ).all()

        if not all_docs:
            return []

        # Score each document: embedding similarity + title overlap bonus
        scored = []
        for doc in all_docs:
            # Compute document embedding (title + content combined for richer signal)
            doc_text = f"{doc.title}\n{doc.content or ''}"
            dvec = embed(doc_text)
            sim = cosine(qvec, dvec)

            # Title overlap bonus (up to +0.35, same as p14-aegis)
            title_bonus = 0.35 * _title_overlap(q_tokens, doc.title)

            # Exact DOC-ID reference in query gives high score
            doc_id_bonus = 0.5 if doc.doc_id.lower() in query.lower() else 0.0

            score = sim + title_bonus + doc_id_bonus
            scored.append((score, doc))

        if not scored:
            return []

        scored.sort(key=lambda x: -x[0])
        best = scored[0][0]

        # Apply dual threshold: absolute MIN_SCORE AND relative floor
        # If the best score is below MIN_SCORE, nothing is relevant enough
        if best < MIN_SCORE:
            return []

        filtered = [
            doc for score, doc in scored
            if score >= MIN_SCORE and score >= RELATIVE_FLOOR * best
        ]

        return filtered[:top_k]
