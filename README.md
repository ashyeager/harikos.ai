# HARIKOS AI

**Verified project state for AI coding agents.**

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

### Local verification

See HARIKOS work end-to-end:

```bash
pnpm exec tsx scripts/demo-transition.ts
```

This creates an isolated test repository, migrates authentication from Clerk to Supabase, and verifies:
- Supabase becomes VERIFIED
- Clerk becomes SUPERSEDED
- Contradictions are surfaced
- Agent context uses current truth

---

## Architecture

**Frontend:** Next.js App Router (TypeScript, Tailwind, shadcn/ui)  
**Backend:** Supabase PostgreSQL + Supabase Auth  
**GitHub Integration:** Read-only GitHub App (Contents and Metadata only)
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

HARIKOS has one complete product with capacity-based plans:

| Plan | Price | Active projects | Agent connections | Continuity |
|---|---:|---:|---:|---|
| Free | $0 | 1 | 1 | Initial scan + 1 manual rescan/month |
| Core | $9/mo | 1 | 1 | Continuous reverification |
| Pro | $29/mo | 5 | 5 | Continuous reverification |
| Scale | $79/mo | 20 | 20 | Continuous reverification |
| Enterprise | Custom | Custom | Custom | Custom agreement |

Free also includes 3 Context Packs and 10 Memory writes per calendar month. Eligible users may choose a 7-day Pro trial. Signed Paddle lifecycle events remain authoritative for paid entitlement.

---

## Deploy to Production

1. **Use the linked Vercel project**
   - Keep the checked-in monorepo build configuration
   - Deploy from the canonical GitHub repository

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
✅ Truth extraction engine with Supabase persistence
✅ Contradiction detection  
✅ Temporal history tracking  
✅ Agent MCP bridge (Remote MCP over HTTP)  
✅ Pricing page  
✅ Security documentation  

---

## Product surface

The cloud product includes the dashboard, repository analysis, Truth and Evidence,
persistent Memory, task-specific Context Packs, remote MCP, agent write-back, and
subscription billing. See the dated release evidence in `DAILY.md` for what has
been verified in each environment.

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
The cloud product requires Supabase and the HARIKOS GitHub App. Local development
and test fixtures remain available for engineering verification.

---

## Quick Links

- **Landing:** [harikos-ai.vercel.app](https://harikos-ai.vercel.app)
- **Product Docs:** [docs/](./docs)
- **Architecture:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Build Status:** [docs/BUILD_STATE.md](./docs/BUILD_STATE.md)

---

## Contributing

HARIKOS is the truth layer for AI agents: one verified project state, available to every authorized agent.

---

**Made by [Ash Yeager](https://twitter.com/ashyeager)**

HARIKOS AI is part of the Harikos company vision for verified, agent-native software development.
