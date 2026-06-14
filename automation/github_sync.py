#!/usr/bin/env python3
"""
github_sync.py — Sync latest GitHub repos into portfolio data
Usage: python automation/github_sync.py
"""
import json, urllib.request, urllib.error, logging, sys
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

GITHUB_USER = "Suryanandankumar2003"
DATA_FILE   = Path(__file__).parent.parent / "backend" / "data" / "projects.json"

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent":"sk-portfolio-sync/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read())
    except Exception as e:
        log.warning(f"Fetch failed: {e}"); return None

def categorize(name, desc=""):
    txt = (name+" "+desc).lower()
    if any(w in txt for w in ["rag","ai","llm","chatbot","ml","model","langchain"]): return "AI/RAG"
    if any(w in txt for w in ["docker","k8s","kubernetes","cicd","pipeline","devops","terraform","infra"]): return "DevOps"
    if any(w in txt for w in ["web","api","django","flask","streamlit","app","tracker"]): return "Web App"
    return "General"

def icon(name):
    n=name.lower()
    if any(w in n for w in ["rag","ai","chatbot","llm"]): return "🤖"
    if any(w in n for w in ["devops","docker","k8s","pipeline"]): return "🚀"
    if any(w in n for w in ["tracker","job","dashboard"]): return "📊"
    return "⚙️"

def main():
    log.info(f"Syncing GitHub repos for {GITHUB_USER}...")
    repos = fetch(f"https://api.github.com/users/{GITHUB_USER}/repos?sort=updated&per_page=20")
    if not repos:
        log.error("Could not fetch repos. Check network/API."); sys.exit(1)

    projects = []
    for i, r in enumerate([r for r in repos if not r.get("fork")], 1):
        projects.append({
            "id": i,
            "name": r["name"],
            "description": r.get("description") or f"A {r.get('language','code')} project.",
            "tech_stack": [r["language"]] if r.get("language") else ["Python"],
            "category": categorize(r["name"], r.get("description","")),
            "github": r["html_url"],
            "status": "Archived" if r.get("archived") else "Active",
            "featured": i <= 3,
            "stars": r.get("stargazers_count",0),
            "updated": r.get("updated_at","")[:10],
            "icon": icon(r["name"]),
        })

    with open(DATA_FILE) as f:
        existing = json.load(f)
    existing["projects"] = projects
    existing["summary"] = f"Suryanandan has {len(projects)} public repositories on GitHub."
    with open(DATA_FILE, "w") as f:
        json.dump(existing, f, indent=2)

    log.info(f"✓ Synced {len(projects)} repos → {DATA_FILE}")

if __name__ == "__main__":
    main()
