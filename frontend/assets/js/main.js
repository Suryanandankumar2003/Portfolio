/* =============================================
   SURYANANDAN KUMAR — main.js v3
   Contact form: FastAPI + EmailJS + localStorage fallback
============================================= */

const BACKEND = "http://localhost:8000"; // ← change to deployed URL in production

// ── EmailJS config ─────────────────────────────────────
// Get free account at emailjs.com → fill these values
const EMAILJS_CONFIG = {
  serviceId:  "YOUR_EMAILJS_SERVICE_ID",   // e.g. "service_abc123"
  templateId: "YOUR_EMAILJS_TEMPLATE_ID",  // e.g. "template_xyz789"
  publicKey:  "YOUR_EMAILJS_PUBLIC_KEY",   // e.g. "user_AbCdEfGhIj"
  enabled:    false,  // set true after filling above values
};

// ── Typed text ──────────────────────────────────────────
class TypeWriter {
  constructor(el, texts, speed=80, pause=2000) {
    this.el=el; this.texts=texts; this.speed=speed; this.pause=pause;
    this.ti=0; this.ci=0; this.del=false; this.type();
  }
  type() {
    const cur = this.texts[this.ti];
    this.el.textContent = cur.substring(0, this.del ? this.ci-1 : this.ci+1);
    this.del ? this.ci-- : this.ci++;
    let t = this.speed;
    if (!this.del && this.ci === cur.length)  { t = this.pause; this.del = true; }
    else if (this.del && this.ci === 0)        { this.del = false; this.ti = (this.ti+1) % this.texts.length; t = 500; }
    else if (this.del)                          { t = this.speed / 2; }
    setTimeout(() => this.type(), t);
  }
}

// ── Scroll Reveal ────────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("revealed"), e.target.dataset.delay || 0);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.dataset.delay = (i % 4) * 100;
    obs.observe(el);
  });
}

// ── Navigation ───────────────────────────────────────────
function initNav() {
  const nav   = document.querySelector(".nav");
  const ham   = document.querySelector(".hamburger");
  const links = document.querySelector(".nav-links");

  window.addEventListener("scroll", () => {
    nav.style.background = window.scrollY > 50 ? "rgba(5,10,16,0.98)" : "rgba(5,10,16,0.9)";
  });

  ham?.addEventListener("click", () => {
    links.classList.toggle("open");
    const s = ham.querySelectorAll("span");
    if (links.classList.contains("open")) {
      s[0].style.transform = "rotate(45deg) translate(5px,5px)";
      s[1].style.opacity   = "0";
      s[2].style.transform = "rotate(-45deg) translate(5px,-5px)";
    } else {
      s[0].style.transform = s[2].style.transform = "";
      s[1].style.opacity = "";
    }
  });

  document.querySelectorAll(".nav-links a").forEach(a =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );

  const sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", () => {
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 100 && window.scrollY < sec.offsetTop + sec.offsetHeight) {
        document.querySelectorAll(".nav-links a").forEach(a => a.classList.remove("active"));
        document.querySelector(`.nav-links a[href="#${sec.id}"]`)?.classList.add("active");
      }
    });
  });
}

// ── Role Tabs ─────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll(".role-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".role-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".role-content").forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab)?.classList.add("active");
    });
  });
}

// ── EmailJS notification ─────────────────────────────────
async function sendEmailJS(data) {
  if (!EMAILJS_CONFIG.enabled) return false;
  try {
    // Load EmailJS SDK if not already loaded
    if (!window.emailjs) {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
      emailjs.init(EMAILJS_CONFIG.publicKey);
    }
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
      from_name:    data.name,
      from_email:   data.email,
      subject:      data.subject,
      message:      data.message,
      to_name:      "Suryanandan Kumar",
      reply_to:     data.email,
      sent_at:      new Date().toLocaleString(),
    });
    console.log("EmailJS notification sent ✓");
    return true;
  } catch (err) {
    console.warn("EmailJS failed (non-critical):", err);
    return false;
  }
}

// ── Contact Form ──────────────────────────────────────────
// Flow: POST /contact (FastAPI) → CSV + SQLite DB + Excel auto-saved
//        + EmailJS notification email to Suryanandan
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn  = form.querySelector(".form-submit");
    const msg  = document.getElementById("form-msg");

    const body = {
      name:    form.querySelector('[name="name"]').value.trim(),
      email:   form.querySelector('[name="email"]').value.trim(),
      subject: form.querySelector('[name="subject"]').value.trim(),
      message: form.querySelector('[name="message"]').value.trim(),
    };

    if (!body.name || !body.email || !body.subject || !body.message) {
      msg.className = "form-message error";
      msg.textContent = "✗ Please fill all required fields.";
      return;
    }

    btn.textContent = "SENDING...";
    btn.disabled = true;

    let backendSaved = false;
    let savedTo = [];

    // ── Step 1: FastAPI backend (CSV + SQLite + Excel) ───
    try {
      const res = await fetch(`${BACKEND}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const data = await res.json();
        backendSaved = true;
        savedTo = data.saved_to || ["CSV", "SQLite DB", "Excel"];
      }
    } catch (_) {
      // Backend offline — save locally
      try {
        const local = JSON.parse(localStorage.getItem("sk_contacts") || "[]");
        local.push({ ...body, date: new Date().toISOString() });
        localStorage.setItem("sk_contacts", JSON.stringify(local));
        savedTo = ["Local Storage (offline backup)"];
      } catch (_) {}
    }

    // ── Step 2: EmailJS notification ─────────────────────
    const emailSent = await sendEmailJS(body);
    if (emailSent) savedTo.push("Email Notification");

    // ── Show result ───────────────────────────────────────
    msg.className = "form-message success";
    msg.innerHTML = `✓ Message received! Suryanandan will reply soon.<br>
      <span style="font-size:0.68rem;opacity:0.7;margin-top:4px;display:block;">
        Saved to: ${savedTo.join(" · ") || "local backup"}
      </span>`;

    form.reset();
    btn.textContent = "⚡ SEND MESSAGE";
    btn.disabled = false;
    setTimeout(() => { msg.className = "form-message"; msg.innerHTML = ""; }, 7000);
  });
}

// ── Particle canvas ───────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById("particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;

  const pts = Array.from({ length: 55 }, () => ({
    x: Math.random() * canvas.width,  y: Math.random() * canvas.height,
    vx: (Math.random() - .5) * .4,    vy: (Math.random() - .5) * .4,
    r: Math.random() * 1.5 + .5,      o: Math.random() * .35 + .1,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;  if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(0,229,255,${p.o})`; ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) {
      for (let j = i+1; j < pts.length; j++) {
        const dx = pts[i].x-pts[j].x, dy = pts[i].y-pts[j].y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,229,255,${.07*(1-d/120)})`; ctx.lineWidth=.5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener("resize", () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; });
}

// ── Counter animation ─────────────────────────────────────
function animateCounters() {
  document.querySelectorAll(".counter").forEach(el => {
    const target = parseInt(el.dataset.target); let cur = 0;
    const step = target / 90;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { el.textContent = target; clearInterval(t); }
      else el.textContent = Math.floor(cur);
    }, 16);
  });
}

// ── Photo upload ──────────────────────────────────────────
function initPhoto() {
  const input = document.getElementById("photo-input");
  const img   = document.getElementById("avatar-img");
  const ph    = document.getElementById("avatar-placeholder");
  if (!input) return;
  const saved = localStorage.getItem("sk_avatar");
  if (saved && img) { img.src = saved; img.style.display = "block"; if (ph) ph.style.display = "none"; }
  input.addEventListener("change", e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (img) { img.src = ev.target.result; img.style.display = "block"; }
      if (ph) ph.style.display = "none";
      localStorage.setItem("sk_avatar", ev.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const typed = document.getElementById("typed-text");
  if (typed) new TypeWriter(typed, [
    "DevOps Engineer", "Cloud Architect",
    "AI / RAG Developer", "Automation Specialist", "Infrastructure Builder",
  ]);

  initNav();
  initScrollReveal();
  initTabs();
  initContactForm();
  initParticles();
  initPhoto();

  // Trigger counters when hero stats visible
  const statsEl = document.querySelector(".hero-stats");
  if (statsEl) {
    const obs = new IntersectionObserver(e => {
      if (e[0].isIntersecting) { animateCounters(); obs.disconnect(); }
    }, { threshold: .5 });
    obs.observe(statsEl);
  }

  // Active nav highlight style
  const s = document.createElement("style");
  s.textContent = ".nav-links a.active{color:var(--accent-cyan)!important;}";
  document.head.appendChild(s);
});
