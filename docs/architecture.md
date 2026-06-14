# 🏗️ Architecture — Suryanandan Kumar Portfolio

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER / USER                          │
│  index.html + style.css + main.js + skbot.js + skbot.css   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / Fetch API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND (Python)                       │
│                                                             │
│  POST /chat  ──► chatbot.py ──► rag.py                     │
│  POST /contact ──► contacts.csv                            │
│  GET  /health                                               │
└──────────┬────────────────────────────────────┬────────────┘
           │                                    │
           ▼                                    ▼
┌──────────────────────┐          ┌─────────────────────────┐
│   RAG PIPELINE       │          │   CONTACTS DATABASE     │
│                      │          │                         │
│  vector_store.py     │          │   contacts.csv          │
│  ChromaDB            │          │   (append-only)         │
│  sentence-           │          └─────────────────────────┘
│  transformers        │
│  (HuggingFace)       │
│       │              │
│       ▼              │
│  Mistral AI API      │
│  (LLM generation)    │
└──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│   KNOWLEDGE BASE (data/)         │
│                                  │
│   about.json                     │
│   skills.json                    │
│   projects.json                  │
│   experience.json                │
│   education.json                 │
│   certifications.json            │
│   achievements.json              │
└──────────────────────────────────┘
```

## RAG Pipeline Flow

```
User Question
     │
     ▼
Input Sanitization (XSS strip, length check)
     │
     ▼
Session Manager (chatbot.py) — per-user history
     │
     ▼
RAG Chain (rag.py)
     │
     ├── Embed question → HuggingFace all-MiniLM-L6-v2
     │
     ├── Similarity search → ChromaDB vectorstore
     │      └── Returns top-4 relevant chunks
     │
     ├── Build prompt with context + chat history
     │
     └── Mistral AI (mistral-small-latest) → Answer
           │
           ▼ (fallback if API unavailable)
     Rule-based local answers from FALLBACK_KNOWLEDGE
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (CSS Variables), Vanilla JS |
| Bot Widget | Custom floating widget (skbot.js + skbot.css) |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| RAG Framework | LangChain |
| Vector Store | ChromaDB (persistent) |
| Embeddings | sentence-transformers/all-MiniLM-L6-v2 (HuggingFace, free, local) |
| LLM | Mistral AI — mistral-small-latest (free tier API) |
| Data Storage | JSON (knowledge base), CSV (contacts) |
| Automation | Python scripts (github_sync, contact_export, report) |
