<div align="center">

# DebugDiary

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel)
![VS Code](https://img.shields.io/badge/VS_Code_Extension-007ACC?style=for-the-badge&logo=visualstudiocode)
![SDK](https://img.shields.io/badge/JS_SDK-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js_SDK-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Brevo](https://img.shields.io/badge/Brevo-0B996E?style=for-the-badge&logo=sendinblue&logoColor=white)

</div>

---

<div align="center">

> **Stack Overflow helps strangers.**  
> **DebugDiary helps you.**

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

### 🔌 VS Code Extension
Right-click any error in your editor or terminal. Save it in two inputs without leaving VS Code. Déjà Vu fires as a native VS Code notification — your past fix appears before you've opened a browser tab.

### ⚡ JavaScript SDK
One script tag. Any website. Errors captured automatically in the background. No code changes needed beyond the script tag. Breadcrumb timeline shows exactly what the user did before crashing.

### 🟢 Node.js SDK
One-time setup in any Express or Node.js app. Auto-captures uncaught exceptions, unhandled promise rejections, and every HTTP request as a breadcrumb. Server-side User Journey timeline included.

### 🔁 Error Grouping
Same error from multiple users or sessions gets grouped into one entry with occurrence count. Prevents dashboard noise. Tracks first seen, last seen, and affected pages.

### � Twice-Daily Email Digest
Morning (8AM) and Evening (10PM) digest emails in your timezone. Error summary, AI fixes, occurrence counts — waiting in your inbox. All clear email sent even when no errors occur.

---

## Demo

🌐 **Live:** https://debugdiary.vercel.app/ 

Demo credentials:  
Email:    `devdebugdiary@gmail.com`  
Password: `demo2026` 

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase PostgreSQL |
| ORM | Prisma |
| AI | Google Gemini 2.5 Flash |
| Embeddings | Gemini Embedding 1 |
| Auth | NextAuth.js |
| Styling | Tailwind CSS + shadcn/ui |
| Deployment | Vercel |
| Extension | VS Code Extension API |
| Email | Brevo |
| JS SDK | Vanilla JS (public/sdk.js) |
| Node SDK | CommonJS (public/sdk-node.js) |
| Cron | GitHub Actions |
| Rate Limiting | In-memory (lib/rateLimit.ts) |

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

**SDK Setup**

<img width="1919" height="918" alt="Screenshot 2026-02-28 183223" src="https://github.com/user-attachments/assets/83a81642-4999-4c00-a9db-416eddbff375" />


<img width="1919" height="921" alt="image" src="https://github.com/user-attachments/assets/397c5904-9657-45ee-a6ec-e9b161104bbf" />

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Google AI Studio API key (for Gemini)
- Brevo account (for email digests)
- Google Cloud Project & GitHub OAuth App (for Social Login)

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

Create `.env.local` based on `.env.example`:
```env
# Database
DATABASE_URL="your_supabase_pooled_url"
DIRECT_URL="your_supabase_direct_url"

# AI
GEMINI_API_KEY="your_gemini_api_key"

# Auth
NEXTAUTH_SECRET="your_random_secret"
NEXTAUTH_URL="http://localhost:3000"

# Social Login (Optional)
GOOGLE_CLIENT_ID="your_google_id"
GOOGLE_CLIENT_SECRET="your_google_secret"
GITHUB_CLIENT_ID="your_github_id"
GITHUB_CLIENT_SECRET="your_github_secret"

# Emails & Crons
BREVO_API_KEY="your_brevo_api_key"
CRON_SECRET="your_secure_cron_secret"
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

## JavaScript SDK

Monitor any website with one line of code.

### Install

Add to any HTML file or web app:
```html
<script 
  src="https://debugdiary.vercel.app/sdk.js"
  data-key="your_api_key"
  data-app="My App Name">
</script>
```

### What Gets Captured Automatically

| Event | Captured |
|-------|---------|
| Uncaught JS errors | ✅ |
| Unhandled Promise rejections | ✅ |
| Console errors | ✅ |
| File + line number | ✅ |
| Page URL + title | ✅ |
| User journey (breadcrumbs) | ✅ |
| AI enrichment + fix | ✅ |

---

## Node.js SDK

Monitor any Express or Node.js app.

### Install

Download sdk-node.js from your SDK Setup page or directly:
https://debugdiary.vercel.app/sdk-node.js

### Setup (one time)
```javascript
const DebugDiary = require('./sdk-node.js')

DebugDiary.init({
  apiKey: 'your_api_key',
  appName: 'My Express App'
})

// Add to Express (optional):
app.use(DebugDiary.expressMiddleware())
app.use(DebugDiary.errorMiddleware())
```

### What Gets Captured Automatically

| Event | Captured |
|-------|---------|
| Uncaught exceptions | ✅ |
| Unhandled rejections | ✅ |
| Every HTTP request (breadcrumb) | ✅ |
| Express errors | ✅ |
| Node version + platform | ✅ |
| User Journey timeline | ✅ |

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

### How SDK Breadcrumbs Work

1. SDK installs silently on any website
2. Every click, navigation, and API call logged as a breadcrumb (max 20)
3. When error fires — breadcrumbs sent alongside error to DebugDiary
4. Entry detail shows full User Journey:
   👆 Clicked "Checkout" → 
   🔴 POST /api/cart failed (500) → 
   💥 TypeError crashed

No configuration. No manual tracking. Automatic from the moment SDK loads.

## Key Technical Decisions

### Cosine Similarity over Vector Database
Déjà Vu uses cosine similarity computed in JavaScript instead of Pinecone or pgvector. Simpler stack, zero extra cost, fast enough for personal journal scale. No external vector DB dependency.

### Gemini over GPT-4
Free tier with 1000 RPD for embeddings and generous Flash limits. Single API handles both enrichment and embeddings. Keeps the stack simple and cost zero for demo and early users.

### Next.js over MERN
MERN is preferred stack but Next.js App Router with Supabase PostgreSQL is more suitable here. Relational data (users, entries, API keys, projects) fits SQL better than MongoDB. Server components reduce client bundle size.

### SDK Architecture over Manual Only
Three input methods — web form, VS Code extension, JavaScript SDK, Node.js SDK. Passive capture removes friction. Developers log more errors when it requires zero effort. Same API, same database, same AI pipeline for all sources.

### Fire-and-Forget AI Enrichment
AI enrichment runs in a background async block after the entry is saved. Response returns immediately to the user. Enrichment completes in ~15 seconds without blocking the UI. Entry polls for updates automatically.

### JWT Sessions over Database Sessions
Stateless sessions work perfectly with Vercel serverless functions. No session table overhead. No connection pool issues from session reads on every request.

### Prisma + pgbouncer for Serverless
Vercel spins up a new function instance per request. Without pgbouncer, connection pool exhausts quickly. connection_limit=1 per function instance with pgbouncer pooling solves this cleanly without upgrading Supabase plan.

### In-Memory Rate Limiting
Rate limiting uses a JavaScript Map instead of Redis. Resets on cold start which happens every ~5 minutes on Vercel free tier. Good enough for abuse prevention without adding Redis cost or complexity.

### GitHub Actions over Vercel Cron
Vercel free tier allows only one cron job. GitHub Actions free tier allows unlimited scheduled workflows. Two digest emails per day (8AM + 10PM) scheduled via GitHub Actions, calling the Vercel API endpoint directly.

---

## Competitive Landscape

| Tool | Purpose | Personal History | Semantic Search | Déjà Vu | Auto Capture | AI Fix |
|------|---------|-----------------|-----------------|---------|-------------|--------|
| Sentry | Production monitoring | ❌ | ❌ | ❌ | ✅ | ❌ |
| Stack Overflow | Community Q&A | ❌ | ❌ | ❌ | ❌ | ❌ |
| ChatGPT | General AI | ❌ | ❌ | ❌ | ❌ | ✅ |
| Notion | Manual notes | ✅ | ❌ | ❌ | ❌ | ❌ |
| **DebugDiary** | **Error Intelligence** | **✅** | **✅** | **✅** | **✅** | **✅** |

---

## Roadmap

### ✅ Shipped
- [x] Personal error journal
- [x] AI enrichment (why + fix)
- [x] Semantic search
- [x] Déjà Vu detection
- [x] VS Code extension
- [x] JavaScript SDK
- [x] Node.js SDK
- [x] Error grouping + deduplication
- [x] Breadcrumb user journey timeline
- [x] Twice-daily email digest
- [x] Rate limiting

### 🔜 Coming Soon
- [ ] Per project isolation
- [ ] Team mode — shared error library
- [ ] Slack alerts
- [ ] GitHub integration
- [ ] Weekly trend reports
- [ ] Python SDK
- [ ] Public error library

---

## Built For

VoidHack 2026 
Built solo by Yash Kumar

Use it, fork it, improve it. Happy debugging! 🚀

---
