import { createHmac, timingSafeEqual } from "node:crypto";

import { cloudBillingWebhookEvents, cloudSubscriptions, cloudUsers, desc, eq, isNull, lt, openCloudDatabase, or, readCloudDatabaseConfig } from "@harikos/db";

import { getAuthIdentity, type AuthIdentity } from "./auth";
import { PLAN_CONFIG, type Plan } from "./entitlements";

const PADDLE_API = "https://api.paddle.com";
const PADDLE_SANDBOX_API = "https://sandbox-api.paddle.com";
type PaddleSubscription = { id?: string; customer_id?: string; status?: string; items?: Array<{ price?: { id?: string } }>; custom_data?: { harikosUserId?: string; plan?: string }; started_at?: string | null; next_billed_at?: string | null; scheduled_change?: { action?: string; effective_at?: string } | null };
function paddleApiUrl(): string { return process.env.PADDLE_ENVIRONMENT === "sandbox" ? PADDLE_SANDBOX_API : PADDLE_API; }
function paddleApiKey(): string { const key = process.env.PADDLE_API_KEY?.trim(); if (!key) throw new Error("Paddle billing is not configured."); return key; }
function planPriceId(plan: Plan): string | undefined { const keys: Record<Exclude<Plan, "enterprise">, string> = { core: "PADDLE_CORE_PRICE_ID", pro: "PADDLE_PRO_PRICE_ID", scale: "PADDLE_SCALE_PRICE_ID" }; return plan === "enterprise" ? undefined : process.env[keys[plan]]?.trim(); }
function planFromPrice(priceId: string | undefined): Plan | undefined { return (["core", "pro", "scale"] as const).find((plan) => planPriceId(plan) === priceId); }
async function paddleFetch(path: string, init: RequestInit): Promise<unknown> { const response = await fetch(`${paddleApiUrl()}${path}`, { ...init, headers: { Authorization: `Bearer ${paddleApiKey()}`, "Content-Type": "application/json", ...(init.headers ?? {}) }, cache: "no-store" }); if (!response.ok) throw new Error("Paddle billing request failed."); return response.json(); }
async function cloudUser(identity: AuthIdentity) { const databaseUrl = readCloudDatabaseConfig(); if (!databaseUrl) throw new Error("PostgreSQL is not configured."); const connection = await openCloudDatabase(databaseUrl, { migrate: false }); const [user] = await connection.db.select().from(cloudUsers).where(eq(cloudUsers.supabaseUserId, identity.id)); return { connection, user }; }

export async function createCheckoutSession(identity: AuthIdentity, selectedPlan: Plan = "pro"): Promise<string> {
  if (selectedPlan === "enterprise") throw new Error("Enterprise checkout is arranged directly."); const priceId = planPriceId(selectedPlan); if (!priceId) throw new Error("Paddle price is not configured."); const { connection, user } = await cloudUser(identity);
  try { if (!user) throw new Error("HARIKOS user profile is not available."); const [current] = await connection.db.select({ status: cloudSubscriptions.status }).from(cloudSubscriptions).where(eq(cloudSubscriptions.userId, user.id)).orderBy(desc(cloudSubscriptions.updatedAt)).limit(1); if (current && ["trialing", "active", "past_due"].includes(current.status)) throw new Error("This account already has a managed subscription."); const response = await paddleFetch("/transactions", { method: "POST", body: JSON.stringify({ items: [{ price_id: priceId, quantity: 1 }], custom_data: { harikosUserId: user.supabaseUserId, plan: selectedPlan } }) }) as { data?: { checkout?: { url?: string } } }; const url = response.data?.checkout?.url; if (!url || !url.startsWith("https://")) throw new Error("Paddle did not return a hosted checkout URL."); return url; } finally { await connection.close(); }
}
export async function createPortalSession(identity: AuthIdentity): Promise<string> {
  const { connection, user } = await cloudUser(identity);
  try { if (!user) throw new Error("HARIKOS user profile is not available."); const [subscription] = await connection.db.select().from(cloudSubscriptions).where(eq(cloudSubscriptions.userId, user.id)).orderBy(desc(cloudSubscriptions.updatedAt)).limit(1); if (!subscription?.providerSubscriptionId) throw new Error("No Paddle subscription exists for this account."); const response = await paddleFetch(`/subscriptions/${encodeURIComponent(subscription.providerSubscriptionId)}`, { method: "GET" }) as { data?: { management_urls?: { update_payment_method?: string; cancel?: string } } }; const url = response.data?.management_urls?.update_payment_method ?? response.data?.management_urls?.cancel; if (!url || !url.startsWith("https://")) throw new Error("Paddle did not return a subscription management URL."); return url; } finally { await connection.close(); }
}
export function verifyPaddleWebhook(payload: string, signature: string | null, secret = process.env.PADDLE_WEBHOOK_SECRET?.trim(), now = Date.now()): boolean {
  if (!secret || !signature) return false; const parts = signature.split(";").map((part) => part.trim().split("=", 2)); const timestamp = parts.find(([key]) => key === "ts")?.[1]; const signatures = parts.filter(([key]) => key === "h1").map(([, value]) => value).filter((value): value is string => Boolean(value)); if (!timestamp || signatures.length === 0 || !/^\d+$/u.test(timestamp) || Math.abs(now - Number(timestamp) * 1000) > 5_000) return false; const expected = createHmac("sha256", secret).update(`${timestamp}:${payload}`).digest("hex"); return signatures.some((candidate) => { const actual = Buffer.from(candidate, "hex"); const expectedBuffer = Buffer.from(expected, "hex"); return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer); });
}
export async function handlePaddleWebhook(payload: string, signature: string | null): Promise<void> {
  if (!verifyPaddleWebhook(payload, signature)) throw new Error("Invalid Paddle webhook.");
  const event = JSON.parse(payload) as { event_id?: string; event_type?: string; occurred_at?: string; data?: PaddleSubscription };
  const subscription = event.data;
  if (!event.event_id || !event.event_type?.startsWith("subscription.") || !subscription?.id) return;
  const supabaseUserId = subscription.custom_data?.harikosUserId;
  const priceId = subscription.items?.[0]?.price?.id;
  const plan = planFromPrice(priceId) ?? (subscription.custom_data?.plan && subscription.custom_data.plan in PLAN_CONFIG ? subscription.custom_data.plan as Plan : undefined);
  if (!supabaseUserId || !plan || !subscription.customer_id || !subscription.status) throw new Error("Paddle billing event is incomplete.");
  const databaseUrl = readCloudDatabaseConfig();
  if (!databaseUrl) throw new Error("PostgreSQL is not configured.");
  const connection = await openCloudDatabase(databaseUrl, { migrate: false });
  const occurredAt = new Date(event.occurred_at ?? Date.now());
  try { await connection.db.transaction(async (tx) => {
    const [seen] = await tx.select().from(cloudBillingWebhookEvents).where(eq(cloudBillingWebhookEvents.providerEventId, event.event_id!));
    if (seen) return;
    const [user] = await tx.select().from(cloudUsers).where(eq(cloudUsers.supabaseUserId, supabaseUserId));
    if (!user) throw new Error("HARIKOS user profile is not available for this billing event.");
    const status = subscription.status;
    const values = { userId: user.id, provider: "paddle", providerCustomerId: subscription.customer_id, providerSubscriptionId: subscription.id, providerPriceId: priceId ?? null, plan, status, trialStart: status === "trialing" ? new Date(subscription.started_at ?? Date.now()) : null, trialEnd: status === "trialing" ? new Date(subscription.next_billed_at ?? Date.now()) : null, currentPeriodStart: subscription.started_at ? new Date(subscription.started_at) : null, currentPeriodEnd: subscription.next_billed_at ? new Date(subscription.next_billed_at) : null, providerOccurredAt: occurredAt, cancelAtPeriodEnd: subscription.scheduled_change?.action === "cancel", updatedAt: new Date() };
    await tx.insert(cloudSubscriptions).values(values).onConflictDoUpdate({ target: cloudSubscriptions.providerSubscriptionId, set: values, where: or(isNull(cloudSubscriptions.providerOccurredAt), lt(cloudSubscriptions.providerOccurredAt, occurredAt)) });
    await tx.insert(cloudBillingWebhookEvents).values({ provider: "paddle", providerEventId: event.event_id!, eventType: event.event_type!, receivedAt: new Date() });
  }); } finally { await connection.close(); }
}
export async function requireBillingIdentity(): Promise<AuthIdentity> { const identity = await getAuthIdentity(); if (!identity) throw new Error("Authentication required."); return identity; }
