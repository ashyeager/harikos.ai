# Frontend / Backend Handoff

## Billing subscription read model

- Blocked frontend state: `/app/settings/billing` cannot render the authenticated user's authoritative current plan, subscription status, renewal date, or cancellation state.
- Observed backend boundary: Stripe webhooks persist subscription state, but the web layer does not expose a user-scoped read function or endpoint for that state.
- Current frontend behavior: the page shows the configured Free and Pro plan definitions plus real checkout/portal availability. It never infers entitlement from a checkout redirect or presents a paid plan as active.
- Backend subsystem: billing subscription query / centralized entitlements.
- Impact: does not block repository, Truth, Memory, Context, or Agent Bridge use. It does block a trustworthy current-plan summary in billing settings.
