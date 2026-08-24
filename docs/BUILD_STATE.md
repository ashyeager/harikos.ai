# HARIKOS AI Build State

Updated: August 24, 2026

## REAL

- The repository is linked to the existing Supabase project `harikos.ai` (`nnhepyqxcffhsgzexxjt`). No new project was created.
- Both cloud migrations are recorded remotely. The live `harikos` schema has all 15 expected tables, all required Memory/AgentSession/Outcome metadata columns, and the two-entry Drizzle journal.
- Every private `harikos` table has RLS enabled. `anon` and `authenticated` have no direct table grants; application writes use the server connection plus explicit ownership checks.
- Supabase Auth callback/session resolution, protected routes, logout, provider-aware identity parsing, and profile/user-row synchronization are implemented. The login page now checks live provider availability and fails closed when no supported provider is enabled.
- Production routes render real cloud data or honest loading/empty/configuration/error states. The flagship fixture is limited to explicit local-demo mode.
- A real authorized scan of `ashyeager/HARIKOS-AI` analyzed 37 bounded sources and persisted five Truth claims with eight Evidence records in Supabase.
- The Clerk-to-Supabase regression verifies Supabase Auth as current, Clerk as superseded, stale documentation as non-current, and excludes Clerk from current Context.
- Real Supabase acceptance passed for project ownership isolation, Memory fresh-read persistence, AgentConnection token hashing/revocation, AgentSession lifecycle, Outcome write-back, Context persistence, and cross-agent handoff.
- Remote MCP acceptance passed over the actual HTTP route for initialization, tool discovery, Truth, Context, Memory and Outcome write-back, valid/invalid/revoked tokens, and wrong-project rejection.
- The signed GitHub push handler rejects invalid signatures and safely handles signed non-push and malformed push events. Repository lookup, bounded rescanning, and ProjectChange persistence are implemented.
- The existing GitHub App is installed on `ashyeager` with read-only code/metadata access and all-repository authorization. Its public configuration, installation, and permission boundary were verified in GitHub.
- Vercel Production uses the correct Supabase project and the canonical `harikos-ai.vercel.app` alias points at the current `harikos-ai-web` deployment.
- Local SQLite/CLI adapters, deterministic scanners, Truth Resolver, contradiction/supersession semantics, and existing Stripe code remain preserved.

## CONFIG REQUIRED

- Create/configure a standard GitHub OAuth App and a Google OAuth client for Supabase Auth. Both providers are disabled remotely. Supabase's GitHub social provider does not accept the existing repository GitHub App as a substitute.
- Local GitHub App private key and webhook secret are missing or placeholder-only. Vercel reports the existing App credentials as present, but App-JWT installation-token/repository-listing verification still requires a usable private key in an acceptance environment.
- Register and deliver the existing GitHub App push webhook to `/api/github/webhook`; the App webhook is currently inactive and blank, so only the handler boundary is acceptance-tested.
- Remove the additional, unused GitHub App client secret created during the Supabase compatibility test after confirming the original production secret remains healthy.
- Rotate/disable the legacy Supabase `service_role` key that was exposed during CLI inspection. HARIKOS does not use it in the corrected local configuration.

## DEFERRED

- Live Stripe configuration and payment/webhook acceptance are outside this pass.
- The dedicated frontend/UI/UX pass follows the non-Stripe functional lock.

## ACCEPTANCE COMMANDS

```text
pnpm verify:cloud:schema
$env:HARIKOS_ACCEPTANCE_GITHUB_TOKEN = gh auth token
pnpm dev:web
pnpm verify:cloud:functional
```

The functional verifier creates isolated synthetic ownership/session records around a real GitHub repository scan and removes them before exit.

## NEXT

1. Create the separate GitHub OAuth App and Google OAuth client, then finish both Supabase provider configurations.
2. Verify the existing GitHub App installation/repository token flow and register live webhook delivery.
3. Re-run the browser login/session/logout acceptance loop.
4. Begin the frontend/UI/UX pass only after the remaining configuration gates are closed.
