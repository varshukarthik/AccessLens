"""
Deterministic local feature-hashing embedder (no API required).
Produces L2-normalised vectors via unigrams + bigrams + synonym expansion.
Provides semantic-ish search for enterprise vocabulary offline.

Ported from p14-aegis embeddings.py with Nova Solutions vocabulary.
"""
from __future__ import annotations

import hashlib
import math
import re

STOP = set("""a an the and or of to in on for with is are was were be been by at as it this that from
what whats how many much do does did i me my we our you your can could please tell show give find
about any all there their them than then into also latest current will would should which who when
where let know need get summarize summarise summary overview key points show find give tell related
documents document docs list search look up locate brief tldr kindly want see""".split())

# Light domain synonym map so the offline embedder behaves "semantically" for enterprise vocabulary.
SYNONYMS = {
    "wfh": ["work", "home", "remote"], "remote": ["wfh", "home"], "remotely": ["remote", "wfh"],
    "pto": ["leave"], "vacation": ["leave"], "holiday": ["leave", "holidays"], "leaves": ["leave"],
    "salary": ["compensation", "pay"], "salaries": ["compensation", "pay"], "pay": ["compensation"],
    "comp": ["compensation"], "ceo": ["executive"], "cxo": ["executive"], "executives": ["executive"],
    "revenue": ["financial", "finance"], "earnings": ["financial", "revenue"], "finance": ["financial"],
    "onboard": ["onboarding"], "joiner": ["onboarding"], "laptop": ["it", "device"], "vpn": ["it", "network"],
    "password": ["security", "credential"], "board": ["strategy", "directors"], "q3": ["quarter", "third"],
    "q4": ["quarter", "fourth"], "forecast": ["projection", "projected"], "projected": ["forecast"],
    "handbook": ["policy", "employee"], "status": ["progress", "report"], "acquisition": ["m&a", "merger"],
    "wifi": ["wi", "fi", "network", "guest"], "cafeteria": ["canteen", "lunch", "food"], "canteen": ["cafeteria"],
    "pan": ["personal", "identification"], "bank": ["account", "financial"], "aadhaar": ["identity", "id"],
    "travel": ["expense", "trip", "business"], "expense": ["travel", "reimbursement"],
    "ticket": ["helpdesk", "support", "it"], "helpdesk": ["ticket", "support", "it"],
    "leave": ["pto", "vacation", "absence", "holiday"], "casual": ["leave", "time-off"],
    "sick": ["leave", "medical", "health"], "parental": ["maternity", "paternity", "leave"],
    "nexusguard": ["ai", "assistant", "workspace"], "novaflow": ["product", "workflow"],
    "novatech": ["nova", "solutions", "company"],
}


def _stem(t: str) -> str:
    for suf in ("ing", "ies", "es", "ed", "s"):
        if len(t) > 4 and t.endswith(suf):
            return t[: -len(suf)] + ("y" if suf == "ies" else "")
    return t


def tokenize(text: str, expand: bool = True) -> list[str]:
    toks = [t for t in re.findall(r"[a-z0-9&]+", text.lower()) if t not in STOP and len(t) > 1]
    out: list[str] = []
    for t in toks:
        out.append(_stem(t))
        if expand:
            out.extend(_stem(s) for s in SYNONYMS.get(t, []))
    return out


def _h(s: str) -> int:
    return int.from_bytes(hashlib.blake2b(s.encode(), digest_size=8).digest(), "little")


EMBEDDING_DIM = 512


def embed(text: str) -> list[float]:
    """Produce a L2-normalised feature-hashing embedding vector."""
    vec = [0.0] * EMBEDDING_DIM
    toks = tokenize(text)
    counts: dict[str, int] = {}
    for t in toks:
        counts[t] = counts.get(t, 0) + 1
    for i in range(len(toks) - 1):
        bg = toks[i] + "_" + toks[i + 1]
        counts[bg] = counts.get(bg, 0) + 1
    for feat, c in counts.items():
        h = _h(feat)
        w = (1 + math.log(c)) * (0.6 if "_" in feat else 1.0)
        vec[h % EMBEDDING_DIM] += w if (h >> 32) & 1 else -w
    n = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / n for v in vec]


def cosine(a: list[float], b: list[float]) -> float:
    """Dot product of two L2-normalised vectors = cosine similarity."""
    return sum(x * y for x, y in zip(a, b))
