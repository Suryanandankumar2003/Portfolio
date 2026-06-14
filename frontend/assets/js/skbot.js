/**
 * skbot.js — SK-Bot RAG Chatbot Widget
 * Suryanandan Kumar Portfolio
 * Floating AI assistant powered by FastAPI + Mistral AI RAG backend.
 * Falls back to smart local KB when backend is offline.
 */
(function () {
  "use strict";

  /* ── CONFIG ─────────────────────────────────────────────── */
  const CFG = {
    backendUrl: "http://localhost:8000",
    typing: 800,
    avatar: "https://avatars.githubusercontent.com/u/96558855?v=4",
    greeting: "👋 Hi! I'm **SK-Bot**, Suryanandan's AI assistant.\n\nAsk me anything about his **skills**, **projects**, **DevOps** work, **AI/RAG** expertise, or **how to contact** him!",
    chips: [
      "Who is Suryanandan?",
      "What projects has he built?",
      "What are his DevOps skills?",
      "Tell me about his AI/RAG work",
      "What cloud tech does he know?",
      "How can I contact him?",
    ],
  };

  /* ── LOCAL FALLBACK KB ──────────────────────────────────── */
  function localAnswer(q) {
    const l = q.toLowerCase();
    const has = (words) => words.some((w) => l.includes(w));

    if (has(["hi","hello","hey","howdy","sup"]))
      return "👋 Hey! I'm SK-Bot. Ask me about Suryanandan's skills, projects, DevOps or AI work, or how to reach him!";

    if (has(["contact","email","reach","hire","connect","linkedin","github","phone"]))
      return "📬 **Contact Suryanandan Kumar:**\n\n• 📧 **Email:** suryanandankumar2003@gmail.com\n• 🔗 **LinkedIn:** [linkedin.com/in/suryanandan-kumar](https://linkedin.com/in/suryanandan-kumar)\n• ⎔ **GitHub:** [github.com/Suryanandankumar2003](https://github.com/Suryanandankumar2003)\n• 📍 **Location:** Gurugram, India (UTC +05:30)";

    if (has(["devops","docker","kubernetes","k8s","terraform","ansible","jenkins","ci/cd","pipeline","cicd","gitops"]))
      return "🛠️ **Suryanandan's DevOps Stack:**\n\n• **Containers:** Docker, Kubernetes (K8s)\n• **IaC:** Terraform, Ansible\n• **CI/CD:** Jenkins, GitHub Actions, GitOps\n• **Cloud:** AWS (EC2, S3, Lambda, RDS, IAM, VPC), GCP\n• **Monitoring:** Prometheus, Grafana\n• **OS:** Linux / Ubuntu\n\nHe designs fully automated pipelines from code commit → production.";

    if (has(["aws","cloud","gcp","infrastructure","infra","serverless","ec2","s3","lambda"]))
      return "☁️ **Suryanandan's Cloud Skills:**\n\n• **AWS:** EC2, S3, RDS, Lambda, VPC, IAM, CloudWatch, DynamoDB\n• **GCP:** Compute Engine, Cloud Storage\n• **IaC:** Terraform modules, Ansible playbooks\n• **Containers:** Docker + Kubernetes on cloud\n• **Automation:** Shell scripts, GitHub Actions, Cron jobs";

    if (has(["ai","ml","rag","machine learning","llm","chatbot","langchain","mistral","faiss","chroma","embedding","vector","huggingface"]))
      return "🤖 **Suryanandan's AI/RAG Stack:**\n\n• **RAG Frameworks:** LangChain, LlamaIndex\n• **Vector Stores:** FAISS, ChromaDB, Pinecone\n• **LLMs:** Mistral AI, HuggingFace Transformers\n• **Embeddings:** sentence-transformers/all-MiniLM-L6-v2\n• **ML:** TensorFlow, PyTorch, scikit-learn, OpenCV\n\nHis flagship project is a **PDF-RAG-Chatbot** using LangChain + Mistral AI + FAISS + Streamlit.";

    if (has(["skill","tech","stack","language","tools","know","python","c++","javascript"]))
      return "💻 **Suryanandan's Full Tech Stack:**\n\n☁️ **Cloud/DevOps:** AWS, GCP, Docker, Kubernetes, Terraform, Ansible, Jenkins\n🤖 **AI/RAG:** LangChain, FAISS, ChromaDB, Mistral AI, HuggingFace\n💻 **Languages:** Python, C++, JavaScript, Java, Bash/Shell, SQL\n📚 **Frameworks:** Django, FastAPI, Streamlit\n🗄️ **Databases:** MySQL, PostgreSQL, DynamoDB, SQLite, Redis";

    if (has(["project","built","build","app","pdf","job","tracker","portfolio","github"]))
      return "🚀 **Suryanandan's Projects:**\n\n🤖 **PDF-RAG-Chatbot** — AI chatbot using LangChain + Mistral AI + FAISS + Streamlit. Answers questions from any PDF with persistent history.\n\n📊 **Job Application Tracker** — Streamlit app with authentication, status tracking & analytics dashboard.\n\n🏗️ **K8s CI/CD Pipeline** *(in progress)* — End-to-end DevOps with Terraform, Jenkins, AWS & Prometheus.\n\n🔗 [github.com/Suryanandankumar2003](https://github.com/Suryanandankumar2003)";

    if (has(["experience","role","career","journey","background","work"]))
      return "💼 **Suryanandan's Roles:**\n\n🛠️ **DevOps Engineer** — CI/CD, Docker, K8s, IaC, Cloud monitoring\n☁️ **Cloud Architect** — AWS, GCP, Terraform, Serverless\n🤖 **AI/RAG Developer** — LangChain, RAG pipelines, vector DBs, LLMs\n💻 **Software Engineer** — Python, C++, Django, REST APIs, Streamlit\n\nBased in **Gurugram, India** · Open to remote and on-site opportunities.";

    if (has(["education","degree","college","university","study","certif"]))
      return "🎓 **Education & Learning:**\n\nSuryanandan has a Computer Science background with strong self-directed learning in DevOps, Cloud, and AI technologies.\n\nHe is actively pursuing **AWS** and **DevOps certifications** and has hands-on foundations in Docker, Kubernetes, and cloud architecture.\n\nHe learns by building real projects — his GitHub shows active, practical work.";

    if (has(["who","about","yourself","introduce","suryanandan","tell me","summary"]))
      return "👨‍💻 **Suryanandan Kumar** is a **DevOps Engineer**, **Cloud Architect** & **AI/RAG Developer** from **Gurugram, India**.\n\nHe builds reliable, automated infrastructure and intelligent AI systems — combining Docker, Kubernetes, Terraform, LangChain, and Mistral AI into production-ready solutions.\n\n*\"If something can be automated, I'll script it — laziness is just efficiency in disguise.\"*\n\n📧 suryanandankumar2003@gmail.com";

    return "🤖 I can answer questions about Suryanandan's:\n\n• **Skills** — DevOps, Cloud, AI/RAG, Programming\n• **Projects** — PDF-RAG-Chatbot, Job Tracker, K8s Pipeline\n• **Experience** — DevOps, Software, AI Engineering roles\n• **Contact** — Email, LinkedIn, GitHub\n\nWhat would you like to know?";
  }

  /* ── MARKDOWN → HTML ────────────────────────────────────── */
  function md(t) {
    return t
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n•/g, "<br>•")
      .replace(/\n\n/g, "<br><br>")
      .replace(/\n/g, "<br>");
  }

  /* ── DOM BUILD ──────────────────────────────────────────── */
  function buildDOM() {
    document.body.insertAdjacentHTML("beforeend", `
<button class="skbot-fab" id="skbot-fab" aria-label="Open SK-Bot">
  <span class="skbot-tooltip">Ask SK-Bot about me!</span>
  <span class="skbot-fab-icon" id="skbot-icon">🤖</span>
</button>
<div class="skbot-window" id="skbot-win" role="dialog" aria-modal="true">
  <div class="skbot-header">
    <img class="skbot-avatar" src="${CFG.avatar}" alt="SK" onerror="this.style.display='none'">
    <div class="skbot-header-info">
      <div class="skbot-header-name">SK-Bot · Suryanandan's AI</div>
      <div class="skbot-header-status"><span class="skbot-status-dot"></span>Online · Mistral AI + RAG</div>
    </div>
    <button class="skbot-close" id="skbot-x" aria-label="Close">✕</button>
  </div>
  <div class="skbot-messages" id="skbot-msgs"></div>
  <div class="skbot-suggestions" id="skbot-chips"></div>
  <div class="skbot-input-area">
    <textarea class="skbot-input" id="skbot-in" rows="1" maxlength="500"
      placeholder="Ask about skills, projects, contact..."></textarea>
    <button class="skbot-send" id="skbot-btn" aria-label="Send">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#050a10"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
    </button>
  </div>
  <div class="skbot-footer">RAG · ChromaDB · Mistral AI · HuggingFace</div>
</div>`);
  }

  /* ── STATE ──────────────────────────────────────────────── */
  let open = false, busy = false, greeted = false;
  let history = [];

  function saveHist() { try { sessionStorage.setItem("skbot_h", JSON.stringify(history)); } catch(_){} }
  function loadHist() { try { const h = sessionStorage.getItem("skbot_h"); if(h) history = JSON.parse(h); } catch(_){} }

  /* ── RENDER MESSAGE ─────────────────────────────────────── */
  function addMsg(role, text, anim = true) {
    const box = document.getElementById("skbot-msgs");
    const isBot = role === "bot";
    const row = document.createElement("div");
    row.className = `skbot-msg ${role}`;

    const icon = document.createElement("div");
    icon.className = "skbot-msg-icon";
    icon.innerHTML = isBot
      ? `<img src="${CFG.avatar}" alt="SK" onerror="this.parentElement.innerHTML='🤖'">`
      : "👤";

    const bub = document.createElement("div");
    bub.className = "skbot-bubble";
    bub.innerHTML = md(text);

    row.appendChild(icon);
    row.appendChild(bub);

    if (anim) { row.style.opacity = "0"; }
    box.appendChild(row);
    if (anim) requestAnimationFrame(() => { row.style.transition = "opacity .3s, transform .3s"; row.style.opacity = "1"; });
    box.scrollTop = box.scrollHeight;
    history.push({ role, text });
    saveHist();
  }

  function showTyping() {
    const box = document.getElementById("skbot-msgs");
    box.insertAdjacentHTML("beforeend",
      `<div class="skbot-msg bot" id="sk-typing">
         <div class="skbot-msg-icon"><img src="${CFG.avatar}" alt="SK" onerror="this.parentElement.innerHTML='🤖'"></div>
         <div class="skbot-bubble"><div class="skbot-typing"><span></span><span></span><span></span></div></div>
       </div>`);
    box.scrollTop = box.scrollHeight;
  }
  function hideTyping() { document.getElementById("sk-typing")?.remove(); }

  /* ── CHIPS ──────────────────────────────────────────────── */
  function renderChips() {
    const el = document.getElementById("skbot-chips");
    if (history.length > 2) { el.innerHTML = ""; return; }
    el.innerHTML = CFG.chips.map(c =>
      `<button class="skbot-chip" data-q="${c}">${c}</button>`).join("");
    el.querySelectorAll(".skbot-chip").forEach(b =>
      b.addEventListener("click", () => { el.innerHTML = ""; send(b.dataset.q); }));
  }

  /* ── API CALL ────────────────────────────────────────────── */
  async function askBackend(q) {
    try {
      const r = await fetch(`${CFG.backendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
        signal: AbortSignal.timeout(12000),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      return d.answer || localAnswer(q);
    } catch (_) {
      return localAnswer(q);
    }
  }

  /* ── SEND ────────────────────────────────────────────────── */
  async function send(text) {
    if (busy) return;
    const raw = (text || document.getElementById("skbot-in").value).trim();
    if (!raw) return;

    document.getElementById("skbot-in").value = "";
    autoSize();
    document.getElementById("skbot-chips").innerHTML = "";
    busy = true;
    document.getElementById("skbot-btn").disabled = true;

    addMsg("user", raw);
    showTyping();
    await new Promise(r => setTimeout(r, CFG.typing));
    const ans = await askBackend(raw);
    hideTyping();
    addMsg("bot", ans);

    busy = false;
    document.getElementById("skbot-btn").disabled = false;
    document.getElementById("skbot-in").focus();
  }

  /* ── OPEN / CLOSE ───────────────────────────────────────── */
  function openBot() {
    open = true;
    document.getElementById("skbot-win").classList.add("open");
    document.getElementById("skbot-fab").classList.add("open");
    document.getElementById("skbot-icon").textContent = "✕";

    if (!greeted) {
      greeted = true;
      loadHist();
      if (history.length === 0) {
        setTimeout(() => { addMsg("bot", CFG.greeting); renderChips(); }, 280);
      } else {
        const box = document.getElementById("skbot-msgs");
        box.innerHTML = "";
        history.forEach(m => addMsg(m.role, m.text, false));
      }
    }
    setTimeout(() => document.getElementById("skbot-in").focus(), 350);
  }

  function closeBot() {
    open = false;
    document.getElementById("skbot-win").classList.remove("open");
    document.getElementById("skbot-fab").classList.remove("open");
    document.getElementById("skbot-icon").textContent = "🤖";
  }

  /* ── AUTO-RESIZE TEXTAREA ───────────────────────────────── */
  function autoSize() {
    const el = document.getElementById("skbot-in");
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }

  /* ── CONTACT FORM INTEGRATION ───────────────────────────── */
  function hookContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector(".form-submit");
      const msgEl = document.getElementById("form-msg");

      const body = {
        name:    form.querySelector('[name="name"]').value.trim(),
        email:   form.querySelector('[name="email"]').value.trim(),
        subject: form.querySelector('[name="subject"]').value.trim(),
        message: form.querySelector('[name="message"]').value.trim(),
      };

      if (!body.name || !body.email || !body.subject || !body.message) {
        msgEl.className = "form-message error";
        msgEl.textContent = "✗ Please fill all required fields.";
        return;
      }

      btn.textContent = "SENDING...";
      btn.disabled = true;

      try {
        const res = await fetch(`${CFG.backendUrl}/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const data = await res.json();
          msgEl.className = "form-message success";
          msgEl.textContent = "✓ " + (data.message || "Message sent! Suryanandan will reply soon.");
          form.reset();
        } else {
          throw new Error("Server error");
        }
      } catch (_) {
        // Fallback: save to localStorage
        const contacts = JSON.parse(localStorage.getItem("sk_contacts") || "[]");
        contacts.push({ ...body, date: new Date().toISOString() });
        localStorage.setItem("sk_contacts", JSON.stringify(contacts));
        msgEl.className = "form-message success";
        msgEl.textContent = "✓ Message saved! Suryanandan will get back to you soon.";
        form.reset();
      }

      btn.textContent = "⚡ SEND MESSAGE";
      btn.disabled = false;
      setTimeout(() => { msgEl.className = "form-message"; }, 5000);
    });
  }

  /* ── INIT ────────────────────────────────────────────────── */
  function init() {
    buildDOM();

    document.getElementById("skbot-fab").addEventListener("click", () => open ? closeBot() : openBot());
    document.getElementById("skbot-x").addEventListener("click", closeBot);
    document.getElementById("skbot-btn").addEventListener("click", () => send());
    document.getElementById("skbot-in").addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    });
    document.getElementById("skbot-in").addEventListener("input", autoSize);

    document.addEventListener("click", e => {
      if (open &&
          !document.getElementById("skbot-win").contains(e.target) &&
          !document.getElementById("skbot-fab").contains(e.target)) closeBot();
    });

    // Show tooltip hint after 4 seconds
    setTimeout(() => {
      if (!open) {
        const fab = document.getElementById("skbot-fab");
        fab.classList.add("show-tip");
        setTimeout(() => fab.classList.remove("show-tip"), 4500);
      }
    }, 4000);

    hookContactForm();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

})();
