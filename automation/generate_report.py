#!/usr/bin/env python3
"""
generate_report.py — Daily portfolio status report
Usage: python automation/generate_report.py
"""
import json, csv, logging, urllib.request
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

BASE     = Path(__file__).parent.parent
BACKEND  = BASE/"backend"
DATA_DIR = BACKEND/"data"

def fetch_github_stats(user="Suryanandankumar2003"):
    try:
        req=urllib.request.Request(f"https://api.github.com/users/{user}",headers={"User-Agent":"sk-report/1.0"})
        with urllib.request.urlopen(req,timeout=8) as r: return json.loads(r.read())
    except: return {}

def count_contacts():
    f = BACKEND/"contacts.csv"
    if not f.exists(): return 0
    with open(f) as fp: return max(0, sum(1 for _ in csv.reader(fp))-1)

def main():
    log.info("Generating portfolio report...")
    with open(DATA_DIR/"about.json") as f: about=json.load(f)
    with open(DATA_DIR/"projects.json") as f: projects=json.load(f)
    gh = fetch_github_stats()
    contacts = count_contacts()

    report = f"""
╔══════════════════════════════════════════════════════════════╗
║         SURYANANDAN KUMAR — DAILY PORTFOLIO REPORT           ║
╚══════════════════════════════════════════════════════════════╝
Generated : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

👤 PROFILE
  Name     : {about['name']}
  Role     : {about['title']}
  Location : {about['location']}
  Email    : {about['email']}

📊 GITHUB STATS (Live)
  Public Repos : {gh.get('public_repos', about['stats']['github_repos'])}
  Followers    : {gh.get('followers', '—')}
  Following    : {gh.get('following', '—')}

🚀 PROJECTS ({len(projects['projects'])} total)
"""
    for p in projects["projects"]:
        report += f"  • {p['name']:30s} [{p['category']:12s}] {p['status']}\n"

    report += f"""
📧 CONTACTS
  Total received : {contacts}

{'─'*62}
  Report saved to: backend/data/report_{datetime.now().strftime('%Y%m%d')}.txt
{'─'*62}
"""
    print(report)
    out = DATA_DIR/f"report_{datetime.now().strftime('%Y%m%d')}.txt"
    with open(out,"w") as f: f.write(report)
    log.info(f"✓ Report saved → {out}")

if __name__=="__main__": main()
