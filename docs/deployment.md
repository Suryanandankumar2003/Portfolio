# 🚀 Deployment Guide — SK Portfolio

## Frontend Deployment

### Option 1: GitHub Pages (Free)
```bash
# 1. Push frontend/ folder to GitHub repo
git init && git add . && git commit -m "portfolio v2"
git remote add origin https://github.com/Suryanandankumar2003/portfolio
git push -u origin main

# 2. Go to repo Settings → Pages → Source: main branch / root
# 3. Your site: https://suryanandankumar2003.github.io/portfolio
```

### Option 2: Netlify (Free, Recommended)
```bash
# Drag & drop the frontend/ folder at netlify.com/drop
# Or via CLI:
npm install -g netlify-cli
netlify deploy --dir=frontend --prod
```

**Update backend URL in skbot.js:**
```js
backendUrl: "https://your-backend.onrender.com"
```

---

## Backend Deployment

### Option 1: Render (Free tier)
1. Push backend/ to GitHub
2. New Web Service at render.com
3. Build command: `pip install -r requirements.txt && python ingest.py`
4. Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Add env vars: `MISTRAL_API_KEY`, `ENVIRONMENT=production`

### Option 2: Railway (Free tier)
```bash
npm install -g @railway/cli
railway login
cd backend/
railway init && railway up
```

### Option 3: AWS EC2
```bash
# SSH into instance
ssh -i key.pem ubuntu@your-ec2-ip

# Install Python & dependencies
sudo apt update && sudo apt install python3-pip python3-venv -y
git clone https://github.com/Suryanandankumar2003/portfolio .
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Build vector store
python ingest.py

# Run with PM2 (keeps alive)
npm install -g pm2
pm2 start "uvicorn app:app --host 0.0.0.0 --port 8000" --name sk-api
pm2 save && pm2 startup
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MISTRAL_API_KEY` | Yes | Get free at console.mistral.ai |
| `PORT` | No | Default: 8000 |
| `HOST` | No | Default: 0.0.0.0 |
| `ENVIRONMENT` | No | development / production |
| `CONTACTS_CSV` | No | Default: ./contacts.csv |

```bash
# Copy and fill
cp .env.example .env
nano .env
```

---

## First-Time Setup

```bash
cd backend/

# 1. Install dependencies
pip install -r requirements.txt

# 2. Set API key
echo "MISTRAL_API_KEY=your_key_here" > .env

# 3. Build vector store (once)
python ingest.py

# 4. Start server
uvicorn app:app --reload --port 8000

# 5. Test
curl http://localhost:8000/health
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Who is Suryanandan?"}'
```
