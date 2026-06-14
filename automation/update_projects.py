#!/usr/bin/env python3
"""
update_projects.py — Manually add/update projects in projects.json
Usage: python automation/update_projects.py --add "ProjectName" "Description" "Python,Docker" "DevOps"
       python automation/update_projects.py --list
"""
import json, sys, logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)
DATA = Path(__file__).parent.parent / "backend" / "data" / "projects.json"

def load():
    with open(DATA) as f: return json.load(f)

def save(data):
    with open(DATA,"w") as f: json.dump(data, f, indent=2)
    log.info(f"✓ Saved to {DATA}")

def list_projects():
    data = load()
    log.info(f"\n{'='*50}\n  PROJECTS ({len(data['projects'])} total)\n{'='*50}")
    for p in data["projects"]:
        log.info(f"  [{p['id']}] {p['name']} [{p['category']}] — {p['status']}")

def add_project(name, desc, tech_str, category="General", github="", status="Active"):
    data = load()
    new_id = max((p["id"] for p in data["projects"]), default=0) + 1
    tech = [t.strip() for t in tech_str.split(",")]
    project = {"id":new_id,"name":name,"description":desc,"tech_stack":tech,
               "category":category,"github":github,"status":status,"featured":False,"icon":"⚙️"}
    data["projects"].append(project)
    save(data)
    log.info(f"✓ Added project #{new_id}: {name}")

def main():
    args = sys.argv[1:]
    if not args or args[0]=="--list":
        list_projects()
    elif args[0]=="--add" and len(args)>=5:
        add_project(args[1],args[2],args[3],args[4],args[5] if len(args)>5 else "")
    else:
        print("Usage:\n  python update_projects.py --list\n  python update_projects.py --add NAME DESC TECH CATEGORY [GITHUB]")

if __name__=="__main__": main()
