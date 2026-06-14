# 🚀 Suryanandan Kumar — AI-Powered Portfolio v2

**DevOps Engineer · Cloud Architect · AI & RAG Developer**
📍 Gurugram, India | [GitHub](https://github.com/Suryanandankumar2003) | [LinkedIn](https://linkedin.com/in/suryanandan-kumar) | [Email](mailto:suryanandankumar2003@gmail.com)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Dark Cyberpunk UI** | Animated dark theme with particle canvas, glow effects, typed text |
| 🤖 **SK-Bot RAG Chatbot** | Floating AI assistant powered by Mistral AI + ChromaDB + LangChain |
| 📊 **Contact → CSV** | Form submissions auto-saved to contacts.csv via FastAPI |
| ⚡ **Role Tabs** | DevOps Engineer / Software Engineer / AI Developer showcase |
| 📱 **Responsive** | Mobile-first design, works on all screen sizes |
| 🔄 **GitHub Sync** | Automation script to pull latest repos automatically |
| 📋 **Excel Export** | Contacts exportable to formatted Excel database |

---

## 📁 Folder Structure

```
portfolio/
├── frontend/
│   ├── index.html              ← Main portfolio (open this!)
│   └── assets/
│       ├── css/
│       │   ├── style.css       ← Dark cyberpunk theme
│       │   └── skbot.css       ← Chatbot widget styles
│       └── js/
│           ├── main.js         ← Animations, typed text, tabs
│           └── skbot.js        ← RAG chatbot widget
│
├── backend/
│   ├── app.py                  ← FastAPI server (POST /chat, /contact)
│   ├── chatbot.py              ← Session-aware chatbot manager
│   ├── rag.py                  ← LangChain + Mistral AI RAG chain
│   ├── vector_store.py         ← ChromaDB setup & management
│   ├── ingest.py               ← Build vector store from knowledge base
│   ├── requirements.txt        ← Python dependencies
│   ├── .env.example            ← Environment variables template
│   ├── contacts.csv            ← Contact form submissions
│   ├── logs/                   ← Server logs
│   ├── vectorstore/            ← ChromaDB persistent storage
│   └── data/
│       ├── about.json
│       ├── skills.json
│       ├── projects.json
│       ├── experience.json
│       ├── education.json
│       ├── certifications.json
│       └── achievements.json
│
├── automation/
│   ├── github_sync.py          ← Sync GitHub repos to projects.json
│   ├── contact_export.py       ← Export contacts to Excel
│   ├── update_projects.py      ← Add/edit projects manually
│   └── generate_report.py      ← Daily status report
│
├── docs/
│   ├── architecture.md
│   ├── deployment.md
│   └── api_documentation.md
│
└── README.md
```

---

## ⚡ Quick Start

### Frontend (no backend needed)
```bash
cd frontend/
python3 -m http.server 8080
# Open http://localhost:8080
# Bot uses local fallback KB automatically when backend is offline
```

### Full Stack
```bash
# 1. Backend setup
cd backend/
pip install -r requirements.txt
cp .env.example .env
# Edit .env → add your MISTRAL_API_KEY

# 2. Build vector store (once)
python ingest.py

# 3. Start API server
uvicorn app:app --reload --port 8000

# 4. Open frontend
cd ../frontend/
python3 -m http.server 8080
```

---

## 🤖 SK-Bot — RAG Chatbot

The chatbot uses a full RAG pipeline:

```
User Question → HuggingFace Embeddings → ChromaDB Search
→ Top-4 relevant context chunks → Mistral AI LLM → Answer
```

**When backend is offline:** Smart local fallback answers all questions about Suryanandan without any API.

**Example questions:**
- "Who is Suryanandan?"
- "What are his DevOps skills?"
- "Tell me about his AI projects"
- "Does he know Kubernetes?"
- "How can I contact him?"

---

## 🔑 Environment Variables

```env
MISTRAL_API_KEY=your_key_here     # Get free: console.mistral.ai
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
CONTACTS_CSV=./contacts.csv
```

---

## 🤖 Automation Scripts

```bash
# Sync latest GitHub repos
python automation/github_sync.py

# Export contacts to Excel
python automation/contact_export.py

# Add a new project
python automation/update_projects.py --add "ProjectName" "Desc" "Python,Docker" "DevOps"

# Generate daily report
python automation/generate_report.py
```

---

## 🌐 Deployment

See [docs/deployment.md](docs/deployment.md) for full guide.

| Service | Free Tier | Use For |
|---------|-----------|---------|
| **Netlify** | ✅ | Frontend |
| **GitHub Pages** | ✅ | Frontend |
| **Render** | ✅ | Backend API |
| **Railway** | ✅ | Backend API |
| **AWS EC2** | Free tier | Backend API |

---

## 📡 API Reference

See [docs/api_documentation.md](docs/api_documentation.md) for full API docs.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/chat` | POST | RAG chatbot Q&A |
| `/contact` | POST | Save contact form |
| `/docs` | GET | Swagger UI |

---

*Built with HTML · CSS · JS · FastAPI · LangChain · ChromaDB · Mistral AI · ♥*
*© 2025 Suryanandan Kumar · Gurugram, India*
