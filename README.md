# code.review

AI-powered code reviewer. Paste your code, get back a structured analysis with bugs, security issues, improvements, and a score. Or let it roast you.

**Live:** [codedotreview.vercel.app](https://codedotreview.vercel.app)

---

## what it does

- detects bugs and suggests fixes
- flags security vulnerabilities with severity levels
- recommends improvements across performance, readability, and best practices
- scores your code out of 10
- roasts your code if you're feeling brave

## stack

- **frontend** — React + Vite, deployed on Vercel
- **backend** — Node.js + Express, deployed on Render
- **ai** — Groq API (llama-3.3-70b) for fast inference
- **design** — JetBrains Mono + Syne, dark theme

## architecture
React (Vercel) → Express API (Render) → Groq LLM

frontend and backend are intentionally decoupled so the api key never touches the browser.

## run locally

clone the repo, then:

```bash
# backend
cd server
npm install
# add your GROQ_API_KEY to server/.env
npm run dev

# frontend (new terminal)
cd client
npm install
npm run dev
```

open `http://localhost:5173`

## things i ran into:

- prompt engineering for structured JSON output from LLMs
- CORS configuration across multiple deployment domains
- debugging secret scanning failures in git history

---

