from typing import List, Dict, Any, Tuple
from packaging import version as pkg_version
from app.models.document import Document

class VersionResolver:
    """
    Resolves versions and conflicts on AUTHORIZED evidence ONLY.
    Never evaluates unauthorized documents.
    """

    @staticmethod
    def _parse_version(v_str: str):
        try:
            return pkg_version.parse(v_str)
        except Exception:
            # Fallback simple numeric extraction
            clean = "".join([c for c in v_str if c.isdigit() or c == '.'])
            try:
                return pkg_version.parse(clean if clean else "1.0")
            except Exception:
                return pkg_version.parse("1.0")

    @classmethod
    def resolve_authorized_versions(
        cls, 
        authorized_docs: List[Document],
        query: str
    ) -> Tuple[List[Document], Dict[str, Any]]:
        """
        Groups authorized documents by lineage_group.
        Selects the latest authorized version for each lineage group.
        Preserves superseded versions in the resolution metadata.
        Returns: (selected_docs, resolution_metadata)
        """
        if not authorized_docs:
            return [], {"lineage_groups": {}, "superseded_count": 0, "has_conflicts": False}

        lineage_map: Dict[str, List[Document]] = {}
        for doc in authorized_docs:
            group = doc.lineage_group or doc.title
            if group not in lineage_map:
                lineage_map[group] = []
            lineage_map[group].append(doc)

        selected_docs: List[Document] = []
        resolution_metadata: Dict[str, Any] = {
            "lineage_groups": {},
            "superseded_count": 0,
            "has_conflicts": False
        }

        for group, docs in lineage_map.items():
            if len(docs) == 1:
                selected_docs.append(docs[0])
                resolution_metadata["lineage_groups"][group] = {
                    "selected_doc_id": docs[0].doc_id,
                    "selected_version": docs[0].version,
                    "effective_date": docs[0].effective_date,
                    "superseded_doc_ids": []
                }
            else:
                # Multiple versions in lineage: sort by effective_date descending, then version descending
                def sort_key(d: Document):
                    return (d.effective_date or "", cls._parse_version(d.version))

                sorted_group = sorted(docs, key=sort_key, reverse=True)
                winner = sorted_group[0]
                superseded = sorted_group[1:]

                selected_docs.append(winner)
                resolution_metadata["superseded_count"] += len(superseded)
                resolution_metadata["lineage_groups"][group] = {
                    "selected_doc_id": winner.doc_id,
                    "selected_version": winner.version,
                    "effective_date": winner.effective_date,
                    "superseded_doc_ids": [d.doc_id for d in superseded]
                }

        return selected_docs, resolution_metadata
