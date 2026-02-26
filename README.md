<div align="center">

# DebugDiary

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel)
![VS Code](https://img.shields.io/badge/VS_Code_Extension-007ACC?style=for-the-badge&logo=visualstudiocode)

</div>

---

<div align="center">

> **Stack Overflow helps strangers.**  
> **DebugDiary helps your past self.**

</div>

---

## The Problem

Every developer has been here:

You spend 2 hours debugging an error.  
You fix it. You move on.

Three months later — same error.  
You spend 2 hours again.

ChatGPT forgets everything between sessions.  
Notion is manual and unsearchable.  
Stack Overflow helps people you've never met.  
Sentry monitors production — not your learning.

**There is no tool that remembers YOUR debugging history and surfaces it when you need it.**

DebugDiary is that tool.

---

## What It Does

Four core engines working together:

### ⚡ Déjà Vu Detection
Paste an error you're debugging. Before you waste time, DebugDiary checks your entire history for similar errors. If you've seen it before — it tells you instantly, with your exact fix from last time.

### 🔍 Semantic Search
Search your journal by meaning, not keywords. Type "that weird CORS thing in Express" and find the entry — even if those exact words aren't in it. Powered by Gemini embeddings and cosine similarity.

### ✦ AI Enrichment
Every entry gets automatically enriched: plain-English summary, root cause explanation, auto-tags, language detection, difficulty rating. You paste error + fix. Gemini does the rest.

### � VS Code Extension
Right-click any error in your editor or terminal. Save it in two inputs without leaving VS Code. Déjà Vu fires as a native VS Code notification — your past fix appears before you've opened a browser tab.

---

## Demo

🌐 **Live:** https://debugdiary.vercel.app/ 

Demo credentials:  
Email:    `dev@debugdiary.com`  
Password: `demo2026`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase PostgreSQL |
| ORM | Prisma |
| AI | Google Gemini 2.5 Flash |
| Embeddings | Gemini Embedding 1 |
| Auth | NextAuth.js |
| Styling | Tailwind CSS + shadcn/ui |
| Deployment | Vercel |
| Extension | VS Code Extension API |

---

## Screenshots

**Dashboard**

<img width="1919" height="927" alt="Screenshot 2026-02-26 142614" src="https://github.com/user-attachments/assets/63b6a967-846d-4bdb-ab83-dc1d37c5e1a3" />

**New Entry - Deja vu**

<img width="1919" height="932" alt="Screenshot 2026-02-26 142915" src="https://github.com/user-attachments/assets/9bd5e8b7-c3ca-431c-b6b5-93205e412e3c" />

**All Entries**

<img width="1919" height="928" alt="Screenshot 2026-02-26 143134" src="https://github.com/user-attachments/assets/77181dbe-b2bd-4162-a3b0-e58e68c2b29a" />

**Showing VS Code Extension**

<img width="1919" height="1079" alt="Screenshot 2026-02-26 143315" src="https://github.com/user-attachments/assets/a6a8b0d9-e652-432a-b3b0-f7f9d668bc09" />

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Google AI Studio API key (free tier)

### Installation
```bash
# Clone the repo
git clone https://github.com/yashworkspace1/DebugDiary.git
cd debugdiary

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local` with:
```env
DATABASE_URL="your_supabase_pooled_url"
DIRECT_URL="your_supabase_direct_url"
GEMINI_API_KEY="your_gemini_api_key"
NEXTAUTH_SECRET="your_random_secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Setup
```bash
# Run migrations
npx prisma migrate dev

# Seed demo data
npx prisma db seed
```

### Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

---

## VS Code Extension

### Install

1. Download `debugdiary-0.0.1.vsix`
2. VS Code → Extensions → `...` → Install from VSIX

### Connect
`Ctrl/Cmd + Shift + P`
→ `DebugDiary: Connect Account`
→ Paste your API key

Get your API key at:
`(https://debugdiary.vercel.app/dashboard)/settings/api-keys`

**Note: Login with your own credentials and id to get your own api key**

### Usage

| Action | How |
|--------|-----|
| Save error | Select text → Right-click → Save to DebugDiary |
| Check Déjà Vu | Select error → `Ctrl+Shift+P` → Check Déjà Vu |
| Open Dashboard | Click DebugDiary in status bar |

---

## Project Structure
```text
debugdiary/
├── app/
│   ├── (auth)/          # Login, signup pages
│   ├── (app)/           # Dashboard, entries, search
│   └── api/             # All API routes
├── components/          # Reusable UI components
├── lib/
│   ├── gemini.ts        # AI enrichment + embeddings
│   ├── prisma.ts        # Database client
│   └── badges.ts        # Color config
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Demo data
└── debugdiary-extension/ # VS Code extension
    └── src/
        ├── extension.ts  # Commands + activation
        ├── api.ts        # API calls to backend
        └── auth.ts       # Key storage
```

---

## How Déjà Vu Works

1. User pastes error text
2. Gemini generates 768-dim embedding
3. Compare against all stored embeddings using cosine similarity
4. If similarity > 0.82:
   - Surface matched entry with fix
   - User sees their exact solution from weeks or months ago

No vector database needed — cosine similarity computed in JavaScript. Fast enough for personal use.

---

## Competitive Landscape

| Tool | Purpose | Personal History | Semantic Search | Déjà Vu |
|------|---------|-----------------|-----------------|---------|
| Sentry | Production monitoring | ❌ | ❌ | ❌ |
| Stack Overflow | Community Q&A | ❌ | ❌ | ❌ |
| ChatGPT | General AI | ❌ | ❌ | ❌ |
| Notion | Manual notes | ✅ | ❌ | ❌ |
| **DebugDiary** | **Personal journal** | **✅** | **✅** | **✅** |

---

## Roadmap

- [ ] Team mode — shared error library
- [ ] GitHub integration — auto-log from PRs
- [ ] Weekly digest — "Your top errors this week"
- [ ] Error trend alerts — "You're hitting more TypeErrors lately"
- [ ] Public profiles — share your debug patterns

---

## Built For

VoidHack 2026

---

## License

MIT — use it, fork it, improve it.
