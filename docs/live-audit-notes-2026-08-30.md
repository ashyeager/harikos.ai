# Live audit notes — 2026-08-30

- Production URL `https://harikos-ai.vercel.app/` responded with HTTP 200 through the Vercel fetch integration.
- Homepage metadata is coherent with HARIKOS branding: title `HARIKOS AI — A Project Brain for AI Coding Agents`, canonical URL, OpenGraph image, and project-brain positioning.
- Public homepage exposes Product, Developers, Pricing, Company, Sign in, and Start free navigation; the rendered page includes Truth, Memory, Context, Agent Bridge, security, pricing, FAQ, and CTA sections.
- Browser inspection showed the homepage rendered with HARIKOS's dark technical visual system, grid treatment, cyan/orange accents, and interactive project-brain visualization.
- Selecting Sign in navigated the browser to `/login`, but the browser extraction still showed the homepage content, indicating that this transition should be rechecked after a hard refresh or direct navigation.
- Vercel audit identified the existing project `harikos.ai`, project id `prj_FVS7zOHAtLwYfl7OugAmmymWLqC0`, team `team_PoUS7cEqJvxyWpWCUX3J7xY9`, domains including `harikos-ai.vercel.app`, and latest production deployment `READY` from commit `4043ef7`.
- Existing Supabase connector listed two active projects: `nfhxdvfpctwwijhnrdkv` with a small 3-table public schema and `oypeycvtxiftdsjnrtac` with no public tables. This does not match the repository's documented historical project reference and requires careful environment/linkage verification before any database mutation.
- No secrets were read or modified during this audit.


## Authentication finding

- Directly opening `/login` shows both GitHub and Google provider buttons in production.
- Selecting the GitHub provider returned to `/login` with `error=server_error`, `error_code=unexpected_failure`, and `error_description=Unable to exchange external code: e3eb`. This is a real production authentication failure, not a source-only concern, and must be investigated through Supabase Auth configuration/logs before declaring the product ready.


## Supabase provider finding

The connected Supabase dashboard for project `nfhxdvfpctwwijhnrdkv` confirms that both GitHub and Google providers are enabled. The live GitHub login still fails during external-code exchange, so the likely issue is provider credentials, callback/origin configuration, or project mismatch rather than the provider being disabled. No settings were changed.


The Supabase provider page confirms GitHub and Google are enabled, with email also enabled. The provider cards are interactive but the current viewport did not expose credential fields; no setting was changed during inspection.


The Supabase dashboard exposes the GitHub provider as enabled and opens it with a `provider=GitHub` query parameter, but the provider panel did not return readable content in the browser extraction. I did not change or submit any settings.


## OAuth configuration audit

Supabase’s GitHub provider panel shows the provider enabled, a configured client ID, a configured masked client secret, and the Supabase callback URL `https://nfhxdvfpctwwijhnrdkv.supabase.co/auth/v1/callback`. The connected GitHub account contains two similarly named OAuth Apps, both labeled `HARIKOS AI Auth`, which creates a concrete risk of client-ID mismatch. No secrets were revealed or changed.


## Confirmed OAuth mismatch evidence

The first GitHub OAuth App record, `HARIKOS AI Auth`, has a client ID beginning `Ov23liux...`, while the Supabase provider panel showed a different configured client ID beginning `Ov23liRvi...`. This confirms that Supabase is configured against a different OAuth App than the first record. The GitHub account contains a second app with the same display name, so the second record must be checked before any corrective change is made.


The second GitHub OAuth App record is the one configured in Supabase: its client ID matches the Supabase value. Its registered redirect URI is exactly `https://nfhxdvfpctwwijhnrdkv.supabase.co/auth/v1/callback`, and its homepage is `https://harikos-ai.vercel.app`. The OAuth app also has two unused client secrets. This rules out a client-ID mismatch for the active app and points the live exchange failure toward the active secret or Supabase-side OAuth exchange configuration. No GitHub settings were changed.


## Credential rotation completed

With user confirmation, a fresh client secret was generated for the matching GitHub OAuth App and entered into the existing Supabase GitHub provider configuration. The Supabase provider save control completed without a visible error. The secret itself is intentionally not recorded in repository files or audit notes.


## Live OAuth retest

After the approved credential rotation, the live GitHub sign-in flow succeeded and redirected to `https://harikos-ai.vercel.app/app/projects`. The application rendered the authenticated repository page. The remaining visible issue is separate: the GitHub App integration reports `Credentials not configured`, so repository installation/selection cannot yet proceed until the App private key and related production configuration are corrected.


## GitHub App audit

The existing `HARIKOS AI Project Truth` GitHub App is present with App ID `4693646`, a configured private key, and an active webhook. Its public settings page indicates the App is not missing a key at GitHub; the remaining production error is therefore likely a Vercel environment-value mismatch, malformed private-key formatting, or an app/database linkage mismatch. No App settings were changed.


The GitHub App permissions page confirms a least-privilege boundary: repository Contents is read-only, Metadata is mandatory read-only, and all other displayed repository permissions are no access. The App has a Push event subscription available for the webhook path. No permission changes were made.


The existing `HARIKOS AI Project Truth` GitHub App is installed for the `ashyeager` account. GitHub’s installation page shows the installation as active; repository scope details still need to be inspected from the installation settings or the live app flow.


## Vercel environment audit

The existing Vercel project production environment contains `HARIKOS_SESSION_SECRET`, `GITHUB_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_ID`, `GITHUB_APP_WEBHOOK_SECRET`, `GITHUB_APP_SLUG`, `SUPABASE_PUBLISHABLE_KEY`, `POSTGRES_URL_NON_POOLING`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The current source expects `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL`/`POSTGRES_URL`, and `GITHUB_WEBHOOK_SECRET`, so the production `Credentials not configured` state is explained by variable-name mismatches. Values were not opened or recorded.
