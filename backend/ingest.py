"""
ingest.py
=========
Run this ONCE to build the ChromaDB vector store from your knowledge base.

Usage:
    python ingest.py           # Build (skip if exists)
    python ingest.py --rebuild # Force rebuild
"""

import sys
import logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def main():
    force = "--rebuild" in sys.argv

    logger.info("=" * 55)
    logger.info("  SK PORTFOLIO — Vector Store Ingest")
    logger.info("=" * 55)

    from vector_store import build_vectorstore, load_knowledge_base

    # Preview what will be loaded
    docs = load_knowledge_base()
    logger.info(f"\nLoaded {len(docs)} document chunks:")
    sources = {}
    for doc in docs:
        src = doc.metadata.get("source", "unknown")
        sources[src] = sources.get(src, 0) + 1
    for src, count in sources.items():
        logger.info(f"  {src}: {count} chunks")

    # Build
    logger.info(f"\n{'Rebuilding' if force else 'Building'} ChromaDB vector store...")
    vs = build_vectorstore(force_rebuild=force)
    logger.info("\n✓ Vector store ready!")
    logger.info("  You can now start the backend: uvicorn app:app --reload")
    logger.info("=" * 55)


if __name__ == "__main__":
    main()
