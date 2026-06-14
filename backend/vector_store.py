"""
vector_store.py
===============
ChromaDB vector store — build, load, persist, query.
Embeddings: sentence-transformers/all-MiniLM-L6-v2 (free, local)
"""

import os
import json
import logging
from pathlib import Path
from typing import List

logger = logging.getLogger(__name__)

# ────────────────────────────────────────────────────────────────
# Paths
# ────────────────────────────────────────────────────────────────
DATA_DIR = Path(__file__).parent / "data"
PROJECT_DOCS_DIR = DATA_DIR / "project_docs"
VECTORSTORE_DIR = Path(os.getenv("VECTORSTORE_PATH", "./vectorstore"))

EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# ────────────────────────────────────────────────────────────────
# Main knowledge files
# ────────────────────────────────────────────────────────────────
KNOWLEDGE_FILES = {
    "about.json": "Personal information, bio and contact details",
    "skills.json": "Technical skills and technologies",
    "projects.json": "Projects and portfolio information",
    "experience.json": "Work experience and internships",
    "education.json": "Education background",
    "certifications.json": "Certifications and learning",
    "achievements.json": "Achievements and accomplishments",
    "resume.txt": "Resume and career details",
    "developer_profile.md": "Developer profile and AI knowledge base",
}


# ────────────────────────────────────────────────────────────────
# Embeddings
# ────────────────────────────────────────────────────────────────
def get_embeddings():
    from langchain_huggingface import HuggingFaceEmbeddings

    logger.info(f"Loading embeddings model: {EMBED_MODEL}")

    return HuggingFaceEmbeddings(
        model_name=EMBED_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


# ────────────────────────────────────────────────────────────────
# JSON flattener
# ────────────────────────────────────────────────────────────────
def _flatten_json(data, src: str, pfx: str = "") -> List[str]:
    chunks = []

    if isinstance(data, dict):
        lines = []

        for key, value in data.items():
            if isinstance(value, (str, int, float, bool)):
                lines.append(f"{key}: {value}")

            elif isinstance(value, list):
                items = ", ".join(
                    str(x)
                    for x in value
                    if isinstance(x, (str, int, float, bool))
                )
                if items:
                    lines.append(f"{key}: {items}")

            elif isinstance(value, dict):
                chunks.extend(_flatten_json(value, src, key))

        if lines:
            prefix = f"[{src}"
            if pfx:
                prefix += f" > {pfx}"
            prefix += "]"

            chunks.append(prefix + "\n" + "\n".join(lines))

    elif isinstance(data, list):
        for item in data:
            chunks.extend(_flatten_json(item, src, pfx))

    return chunks


# ────────────────────────────────────────────────────────────────
# Load all knowledge files
# ────────────────────────────────────────────────────────────────
def load_knowledge_base():
    from langchain.schema import Document

    docs = []

    logger.info("=" * 55)
    logger.info("Loading knowledge base...")
    logger.info("=" * 55)

    # ------------------------------------------------------------
    # Load JSON / TXT / MD files from data/
    # ------------------------------------------------------------
    for filename, desc in KNOWLEDGE_FILES.items():
        path = DATA_DIR / filename

        if not path.exists():
            logger.warning(f"Missing file: {path}")
            continue

        try:
            if filename.endswith(".json"):
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                chunks = _flatten_json(
                    data,
                    filename.replace(".json", "")
                )

            elif filename.endswith(".txt") or filename.endswith(".md"):
                with open(path, "r", encoding="utf-8") as f:
                    text = f.read()

                # Better chunking for RAG
                chunks = [
                    text[i:i + 800]
                    for i in range(0, len(text), 600)
                ]

            else:
                continue

            for chunk in chunks:
                if chunk.strip():
                    docs.append(
                        Document(
                            page_content=chunk.strip(),
                            metadata={
                                "source": filename,
                                "desc": desc,
                                "type": "knowledge_base",
                            },
                        )
                    )

            logger.info(f"  {filename}: {len(chunks)} chunks")

        except Exception as e:
            logger.error(f"Error loading {filename}: {e}")

    # ------------------------------------------------------------
    # Automatically load all project README markdown files
    # ------------------------------------------------------------
    if PROJECT_DOCS_DIR.exists():
        logger.info("")
        logger.info("Loading project documentation...")

        for md_file in PROJECT_DOCS_DIR.glob("*.md"):
            try:
                with open(md_file, "r", encoding="utf-8") as f:
                    text = f.read()

                chunks = [
                    text[i:i + 800]
                    for i in range(0, len(text), 600)
                ]

                for chunk in chunks:
                    if chunk.strip():
                        docs.append(
                            Document(
                                page_content=chunk.strip(),
                                metadata={
                                    "source": md_file.name,
                                    "desc": "Project README Documentation",
                                    "type": "project_readme",
                                },
                            )
                        )

                logger.info(f"  {md_file.name}: {len(chunks)} chunks")

            except Exception as e:
                logger.error(
                    f"Error loading {md_file.name}: {e}"
                )

    logger.info("")
    logger.info(f"Total: {len(docs)} document chunks loaded")

    return docs


# ────────────────────────────────────────────────────────────────
# Build or load vector store
# ────────────────────────────────────────────────────────────────
def build_vectorstore(force=False, force_rebuild=None):
    """
    Build or load the ChromaDB vector store.

    Supports:
        build_vectorstore(force=True)
        build_vectorstore(force_rebuild=True)
    """

    from langchain_community.vectorstores import Chroma

    # Backward compatibility
    if force_rebuild is not None:
        force = force_rebuild

    embeddings = get_embeddings()
    vs_path = str(VECTORSTORE_DIR)

    # Load existing vector store
    if (
        VECTORSTORE_DIR.exists()
        and any(VECTORSTORE_DIR.iterdir())
        and not force
    ):
        logger.info(
            f"Loading existing vectorstore from: {vs_path}"
        )

        return Chroma(
            persist_directory=vs_path,
            embedding_function=embeddings,
            collection_name="sk_portfolio",
        )

    # Build new vector store
    logger.info("")
    logger.info("Building vectorstore from scratch...")

    docs = load_knowledge_base()

    if not docs:
        raise ValueError(
            "No documents found. Check backend/data/"
        )

    vectorstore = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory=vs_path,
        collection_name="sk_portfolio",
    )

    logger.info("")
    logger.info(
        f"Vectorstore built successfully with "
        f"{len(docs)} chunks."
    )
    logger.info(f"Saved to: {vs_path}")

    return vectorstore


# ────────────────────────────────────────────────────────────────
# Public helper
# ────────────────────────────────────────────────────────────────
def get_vectorstore():
    return build_vectorstore(force=False)