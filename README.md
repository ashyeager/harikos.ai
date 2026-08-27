# HARIKOS AI

**A verified project brain for AI coding agents.**

[Live Product](https://harikos-ai.vercel.app) · [GitHub](https://github.com/ashyeager/harikos.ai) · [Docs](./docs)

---

## What It Does

HARIKOS keeps your project's truth straight while your agents move fast.

When you use Claude Code, Cursor, or Codex to build software, agents solve problems but forget context between sessions. Documentation drifts from code. One agent learns something the next agent never sees.

HARIKOS watches your repository and answers one question: **What is true right now?**

It does this by:
- **Extracting claims** from your code (auth system, database type, key constraints)
- **Finding evidence** for each claim (file paths, line numbers, commits)
- **Detecting changes** when you migrate (Clerk → Supabase)
- **Showing contradictions** when docs disagree with code
- **Preparing context** for agents so they understand the project

---

## Get Started

### Live (No Setup)

1. Go to [harikos-ai.vercel.app](https://harikos-ai.vercel.app)
2. Click "Connect repository"
3. Sign in with GitHub
4. Select a repository
5. See your project's verified truths

### Local Development

**Requirements:**
- Node.js 20+
- pnpm 11+
- Git

**Install:**

```bash
pnpm install
pnpm build
```

**Run locally:**

```bash
pnpm dev:web
```

Open http://localhost:3000. Public landing page works immediately. To test auth and database features, add Supabase credentials to `.env.local` (copy from `.env.example`).

**Verify everything works:**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

---

## How It Works

### The Product Flow

```
You have a repo → HARIKOS analyzes it
            ↓
    Extracts claims with evidence
            ↓
    Builds your project's Truth
            ↓
    Agents get current context
            ↓
    No more stale assumptions
```

### The Local CLI

For development and offline verification:

```bash
# Initialize local project state
pnpm exec harikos init --cwd .

# Scan your repository for claims
pnpm exec harikos scan --cwd .

# Show the truth for this project
pnpm exec harikos truth --cwd .

# Generate context for a task
pnpm exec harikos context --cwd . --task "Add OAuth"
```

Local state lives in `.harikos/` (ignored by Git).

### The Proof

See HARIKOS work end-to-end:

```bash
pnpm demo
```

This creates a test repository, migrates authentication from Clerk to Supabase, and proves:
- Supabase becomes VERIFIED
- Clerk becomes SUPERSEDED
- Contradictions are surfaced
- Agent context uses current truth

---

## Architecture

**Frontend:** Next.js App Router (TypeScript, Tailwind, shadcn/ui)  
**Backend:** Supabase PostgreSQL + Supabase Auth  
**GitHub Integration:** Read-only OAuth App (no code writes)  
**Deployment:** Vercel  

**Monorepo structure:**
```
apps/web/          ← Next.js product
packages/core/     ← Truth extraction logic
packages/db/       ← Supabase schema + migrations
```

See `docs/ARCHITECTURE.md` for full details.

---

## Pricing

| | Free | Pro |
|---|---|---|
| **Price** | $0 | $15/mo |
| **Repositories** | 1 | 5 |
| **Memories** | 250 | Unlimited |
| **Context Packs/mo** | 25 | Unlimited |
| **Agent Connections** | 1 | 5 |

Start free. Upgrade as you scale.

---

## Deploy to Production

1. **Create a Vercel project**
   - Set "Root Directory" to `apps/web`
   - Connect your GitHub repo

2. **Connect Supabase**
   - Create a Supabase project
   - Link via Vercel Marketplace (or manually add env vars)
   - Run migrations: `pnpm db:migrate:cloud`

3. **Configure GitHub OAuth**
   - Create a GitHub OAuth App (for login, not repo scanning)
   - Add credentials to Supabase Authentication → GitHub provider

4. **Deploy**
   - Push to main branch
   - Vercel auto-deploys

For detailed setup, see `docs/DEPLOY.md`.

---

## What's Done

✅ Landing page with full product story  
✅ GitHub OAuth login flow  
✅ Supabase database schema (15 tables)  
✅ Truth extraction engine (Clerk → Supabase demo proven)  
✅ Contradiction detection  
✅ Temporal history tracking  
✅ Agent MCP bridge (Remote MCP over HTTP)  
✅ Pricing page  
✅ Security documentation  

---

## What's Coming

📋 Dashboard (view your projects)  
📋 Project analyzer (connect repo → see claims)  
📋 Context pack generation (task-specific briefs)  
📋 Memory recording (decisions that survive sessions)  
📋 Stripe payments  
📋 Agent integration UI  

---

## FAQ

**Is HARIKOS another AI coding agent?**  
No. HARIKOS is the shared brain *around* your coding agents. While they code, HARIKOS watches the repository and keeps the truth straight.

**Does it store my entire codebase?**  
No. HARIKOS analyzes relevant files, extracts structured claims, and stores evidence pointers (file paths, line numbers). It's not a full-code mirror.

**What coding agents can connect?**  
Any MCP client: Claude, Codex, Cursor, or custom tools.

**Why verify truth instead of just using embeddings?**  
Embeddings hallucinate. HARIKOS grounds every claim in actual repository evidence. You can see *why* it believes something.

**Can I run this locally?**  
Yes. The CLI tools work offline. The cloud product requires Supabase + GitHub.

---

## Quick Links

- **Landing:** [harikos-ai.vercel.app](https://harikos-ai.vercel.app)
- **Product Docs:** [docs/](./docs)
- **Architecture:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Build Status:** [docs/BUILD_STATE.md](./docs/BUILD_STATE.md)

---

## Contributing

This is a solo-built MVP. Feedback and questions welcome at the GitHub repo.

---

**Made by [Ash Yeager](https://twitter.com/ashyeager)**

HARIKOS AI is part of the Harikos company vision for verified, agent-native software development.
