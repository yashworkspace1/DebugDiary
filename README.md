# DebugDiary

> Stack Overflow helps strangers.  
> DebugDiary helps your past self.

## The Problem
Developers solve the same bugs repeatedly.
No personal, searchable, AI-enriched log
of your own debugging history exists.
ChatGPT forgets. Notion is manual.
Stack Overflow helps strangers, not you.

## What It Does
- Paste error + fix → Gemini AI enriches it
- Semantic search finds errors by meaning
- Déjà Vu detector surfaces past fixes
- VS Code extension — never leave your editor

## Tech Stack
Next.js 14 · Supabase PostgreSQL · Prisma
Google Gemini 2.5 Flash · NextAuth.js
Tailwind · shadcn/ui · VS Code Extension API

## Live Demo
URL: https://debugdiary-production.vercel.app
Login: dev@debugdiary.com / demo2026

## Run Locally
```bash
git clone https://github.com/your-username/debugdiary
cd debugdiary
npm install
cp .env.example .env.local
# fill in your keys
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## VS Code Extension
Install: `debugdiary-0.0.1.vsix`
Connect: `Ctrl+Shift+P` → `DebugDiary: Connect`
API Key: `https://debugdiary-production.vercel.app/settings/api-keys`

## Why It's Different
**Sentry** = production monitoring for teams
**Notion** = too general, fully manual
**Stack Overflow** = strangers' solutions
**ChatGPT** = forgets everything
**DebugDiary** = YOUR history, searchable by meaning, with AI context

Built solo for VoidHack 2026 · 6 days
