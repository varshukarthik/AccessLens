"""
Deterministic, extractive answer composition for NexusGuard.
Ensures zero-hallucination, strictly grounded outputs:
- Precisions sentence scoring with token overlap and length normalization
- Numeric query boosts (+0.35 for numbers/forecasts/budgets/dates)
- Redundant header (-0.4) and title restatement (-0.6) penalties
- Automatic version-conflict detection and governance notices
- Automatic withheld-document notice when higher-tier data exists
"""
from __future__ import annotations

import re
from typing import List, Dict, Any, Tuple, Optional, Set

ANSWER_RX = re.compile(
    r"\b(how many|how much|how long|how do|how can|when|who|which|where|what time|timings?|"
    r"password|limit|deadline|number|amount|forecast|budget|revenue|allowance|entitle\w*|days?|"
    r"hours?|can i|do i|am i|is it|are we)\b", re.I
)
BROAD_RX = re.compile(
    r"\b(polic(y|ies)|guidelines?|handbook|process|procedures?|report|status|plan|overview|"
    r"strategy|show me|tell me about)\b", re.I
)
NUM_RX = re.compile(
    r"(?:₹|rs\.?|inr|\$)?\s?\d[\d,]*(?:\.\d+)?\s?(?:crore|cr|lakh|million|mn|bn|billion|%|days?|"
    r"leaves?|weeks?)?", re.I
)

STOP_WORDS = {
    "a", "an", "the", "is", "are", "was", "were", "what", "which", "who", "whom",
    "this", "that", "these", "those", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "about", "me", "my", "you", "your", "can", "could", "should",
    "would", "do", "does", "did", "tell", "show", "our", "we", "us", "please"
}


def tokenize(text: str) -> List[str]:
    return [w for w in re.findall(r"\b[a-zA-Z0-9_\-\.]+\b", (text or "").lower()) if w not in STOP_WORDS and len(w) > 1]


def split_sentences(text: str) -> List[str]:
    out = []
    for line in re.split(r"\n+", text):
        line = line.strip(" -•*\t")
        if not line or len(line) < 3:
            continue
        # Split by period/exclamation/question if followed by a space and capital letter or digit
        for s in re.split(r"(?<=[.!?])\s+(?=[A-Z0-9₹])", line):
            s = s.strip()
            if len(s) > 2:
                out.append(s)
    return out


def _score(sentence: str, q_tokens: Set[str], numeric_q: bool, title_tokens: Optional[Set[str]] = None) -> float:
    st = set(tokenize(sentence))
    if not st or len(sentence) < 20:
        return -1.0
    overlap = len(q_tokens & st)
    s = overlap / (len(q_tokens) ** 0.5 + 0.1)
    if numeric_q and re.search(r"\d", sentence):
        s += 0.35
    if sentence.endswith(":") or sentence.startswith("#"):
        s -= 0.4  # headings are poor answers
    if title_tokens and len(sentence) < 110 and len(st & title_tokens) >= 0.6 * len(st):
        s -= 0.6  # title restatements
    return s


def extract_numeric_facts(text: str) -> Set[str]:
    """Extract numeric claims (amounts, percentages, days), ignoring standard calendar years."""
    t = re.sub(r"\b(19|20)\d{2}\b", " ", text)
    return {re.sub(r"[\s,]", "", m.group(0).lower()) for m in NUM_RX.finditer(t) if re.search(r"\d", m.group(0))}


def detect_conflicts(evidence_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Detect conflicting numeric facts between different versions of documents in the same family."""
    conflicts = []
    by_family: Dict[str, List[Dict[str, Any]]] = {}
    for item in evidence_items:
        fam = item.get("family_key") or item.get("doc_id") or item.get("document_id")
        by_family.setdefault(fam, []).append(item)

    for fam, items in by_family.items():
        if len(items) > 1:
            # Sort items by version string
            def ver_key(it):
                digits = [int(d) for d in re.findall(r"\d+", str(it.get("version", "1.0")))]
                return digits or [0]
            sorted_items = sorted(items, key=ver_key)
            latest = sorted_items[-1]
            latest_facts = extract_numeric_facts(latest.get("content", ""))
            for older in sorted_items[:-1]:
                older_facts = extract_numeric_facts(older.get("content", ""))
                if latest_facts and older_facts and latest_facts != older_facts:
                    conflicts.append({
                        "family": fam,
                        "latest": latest,
                        "older": older,
                        "note": (
                            f"'{latest.get('title')}' v{latest.get('version')} ({latest.get('document_id') or latest.get('doc_id')}) "
                            f"supersedes v{older.get('version')} ({older.get('document_id') or older.get('doc_id')}); "
                            f"values differ — the latest version is authoritative."
                        )
                    })
    return conflicts


def best_sentences(
    query: str,
    evidence_items: List[Dict[str, Any]],
    n: int = 3
) -> List[Tuple[str, Dict[str, Any]]]:
    q_tokens = set(tokenize(query))
    numeric_q = bool(re.search(
        r"\b(how many|how much|what is|number|amount|days|limit|revenue|forecast|budget|leaves?|hours?)\b",
        query.lower()
    ))
    pool = []
    for item in evidence_items:
        title = item.get("title", "")
        title_toks = set(tokenize(title))
        content = item.get("content", "")
        for i, s in enumerate(split_sentences(content)):
            score = _score(s, q_tokens, numeric_q, title_toks) - (i * 0.005)
            pool.append((score, s, item))

    pool.sort(key=lambda x: -x[0])
    seen = set()
    out = []
    top_score = pool[0][0] if pool else 0.0
    for sc, s, item in pool:
        if sc <= 0.10 or sc < 0.40 * top_score or s in seen:
            continue
        seen.add(s)
        out.append((s, item))
        if len(out) >= n:
            break
    return out


def compose_grounded_answer(
    query: str,
    evidence_items: List[Dict[str, Any]],
    withheld_count: int = 0,
    quarantined_count: int = 0
) -> str:
    if not evidence_items:
        return "I couldn't find sufficient accessible evidence in company records to answer that question."

    # Check for general document listing questions ("what documents can I access?")
    if any(term in query.lower() for term in ["what documents", "what internal documents", "can i access", "list documents", "my documents", "available documents"]):
        doc_list = "\n".join([f"- **{item['title']}** (`{item.get('document_id') or item.get('doc_id')}`, v{item.get('version', '1.0')}, {item.get('classification', 'Internal')})" for item in evidence_items])
        return f"Based on your authenticated permissions, you have authorized access to the following records:\n\n{doc_list}"

    picks = best_sentences(query, evidence_items, n=3)
    lines: List[str] = []

    if not picks:
        # Fallback to first available document
        top = evidence_items[0]
        sents = split_sentences(top.get("content", ""))[:3]
        doc_id = top.get("document_id") or top.get("doc_id")
        lines.append(f"Based on **{top.get('title')}** (v{top.get('version', '1.0')}) [{doc_id}]:")
        for s in sents:
            lines.append(f"- {s} [{doc_id}]")
    else:
        top_item = picks[0][1]
        top_doc_id = top_item.get("document_id") or top_item.get("doc_id")
        ver = top_item.get("version", "1.0")
        eff = top_item.get("effective_date", "")
        eff_str = f", effective {eff}" if eff else ""
        
        # If single pick, direct concise statement
        if len(picks) == 1:
            s, item = picks[0]
            d_id = item.get("document_id") or item.get("doc_id")
            lines.append(f"Based on **{item.get('title')}** (v{item.get('version', '1.0')}{eff_str}) [{d_id}]:\n\n{s} [{d_id}]")
        else:
            lines.append(f"Based on **{top_item.get('title')}** (v{ver}{eff_str}) [{top_doc_id}]:\n")
            for s, item in picks:
                d_id = item.get("document_id") or item.get("doc_id")
                lines.append(f"- {s} [{d_id}]")

    # Check for version conflicts
    conflicts = detect_conflicts(evidence_items)
    for c in conflicts:
        lines.append(f"\n⚠️ **Version conflict resolved:** {c['note']}")

    # Withheld documents notice
    if withheld_count > 0:
        lines.append(f"\n🔒 {withheld_count} additional relevant document(s) are classified above your access level and were **not** used for this answer.")

    # Quarantined excerpts notice
    if quarantined_count > 0:
        lines.append(f"\n🛡️ {quarantined_count} excerpt(s) were quarantined by the prompt-injection filter and excluded from the answer.")

    return "\n".join(lines).strip()
