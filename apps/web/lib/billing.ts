import { createHmac, timingSafeEqual } from "node:crypto";

import { cloudBillingWebhookEvents, cloudSubscriptions, cloudTrialReservations, cloudUsers, desc, eq, isNull, lt, openCloudDatabase, or, readCloudDatabaseConfig, sql } from "@harikos/db";

import { getAuthIdentity, type AuthIdentity } from "./auth";
import { type PaidPlan, type Plan } from "./entitlements";
import { sendAccountEmail } from "./email";

const PADDLE_API = "https://api.paddle.com";
const PADDLE_SANDBOX_API = "https://sandbox-api.paddle.com";
type PaddleSubscription = { id?: string; customer_id?: string; status?: string; items?: Array<{ price?: { id?: string } }>; custom_data?: { harikosUserId?: string; plan?: string }; started_at?: string | null; next_billed_at?: string | null; current_billing_period?: { starts_at?: string; ends_at?: string } | null; scheduled_change?: { action?: string; effective_at?: string } | null };
type BillingLocation = { countryCode: string; postalCode?: string };

export class ManagedSubscriptionError extends Error {
  constructor() {
    super("This account already has a managed subscription.");
    this.name = "ManagedSubscriptionError";
  }
}
function paddleApiUrl(): string { return process.env.PADDLE_ENVIRONMENT === "sandbox" ? PADDLE_SANDBOX_API : PADDLE_API; }
function paddleApiKey(): string { const key = process.env.PADDLE_API_KEY?.trim(); if (!key) throw new Error("Paddle billing is not configured."); return key; }
function planPriceId(plan: PaidPlan): string | undefined { const keys: Record<Exclude<PaidPlan, "enterprise">, string> = { core: "PADDLE_CORE_PRICE_ID", pro: "PADDLE_PRO_PRICE_ID", scale: "PADDLE_SCALE_PRICE_ID" }; return plan === "enterprise" ? undefined : process.env[keys[plan]]?.trim(); }
function planFromPrice(priceId: string | undefined): PaidPlan | undefined { return (["core", "pro", "scale"] as const).find((plan) => planPriceId(plan) === priceId); }
export function canStartProTrial(history: Array<{ status: string; trialStart: Date | null }>): boolean { return !history.some((item) => item.trialStart !== null || ["trialing", "active", "past_due"].includes(item.status)); }
async function paddleFetch(path: string, init: RequestInit): Promise<unknown> { const response = await fetch(`${paddleApiUrl()}${path}`, { ...init, headers: { Authorization: `Bearer ${paddleApiKey()}`, "Content-Type": "application/json", ...(init.headers ?? {}) }, cache: "no-store" }); if (!response.ok) throw new Error("Paddle billing request failed."); return response.json(); }
async function cloudUser(identity: AuthIdentity) { const databaseUrl = readCloudDatabaseConfig(); if (!databaseUrl) throw new Error("PostgreSQL is not configured."); const connection = await openCloudDatabase(databaseUrl, { migrate: false }); const [user] = await connection.db.select().from(cloudUsers).where(eq(cloudUsers.supabaseUserId, identity.id)); return { connection, user }; }

export async function createCheckoutSession(identity: AuthIdentity, selectedPlan: Plan = "pro", location?: BillingLocation): Promise<string> {
  if (selectedPlan === "free" || selectedPlan === "enterprise") throw new Error("This plan is not available through hosted checkout."); const priceId = planPriceId(selectedPlan); if (!priceId) throw new Error("Paddle price is not configured."); const { connection, user } = await cloudUser(identity);
  try {
    if (!user) throw new Error("HARIKOS user profile is not available.");
    const history = await connection.db.select({ status: cloudSubscriptions.status, trialStart: cloudSubscriptions.trialStart }).from(cloudSubscriptions).where(eq(cloudSubscriptions.userId, user.id)).orderBy(desc(cloudSubscriptions.updatedAt));
    if (history.some((item) => ["trialing", "active", "past_due"].includes(item.status)) || (selectedPlan === "pro" && !canStartProTrial(history))) throw new ManagedSubscriptionError();
    if (selectedPlan !== "pro") {
      const response = await paddleFetch("/transactions", { method: "POST", body: JSON.stringify({ items: [{ price_id: priceId, quantity: 1 }], custom_data: { harikosUserId: user.supabaseUserId, plan: selectedPlan } }) }) as { data?: { checkout?: { url?: string } } };
      const url = response.data?.checkout?.url;
      if (!url || !url.startsWith("https://")) throw new Error("Paddle did not return a hosted checkout URL.");
      return url;
    }
    if (!identity.email || !location?.countryCode) throw new Error("A verified email and billing country are required to start a trial.");
    const expiresAt = new Date(Date.now() + 15 * 60_000);
    const claimed = await connection.db.execute(sql`INSERT INTO harikos.trial_reservations (user_id, expires_at)
      VALUES (${user.id}, ${expiresAt}) ON CONFLICT (user_id) DO UPDATE SET reserved_at = now(), expires_at = EXCLUDED.expires_at, provider_transaction_id = NULL
      WHERE harikos.trial_reservations.completed_at IS NULL AND harikos.trial_reservations.expires_at < now() RETURNING user_id`);
    if (claimed.length === 0) throw new ManagedSubscriptionError();
    {
      const price = await paddleFetch(`/prices/${encodeURIComponent(priceId)}`, { method: "GET" }) as { data?: { trial_period?: { interval?: string; frequency?: number; requires_payment_method?: boolean } } };
      const trial = price.data?.trial_period;
      if (trial?.interval !== "day" || trial.frequency !== 7 || trial.requires_payment_method !== false) throw new Error("The Paddle Pro price is not configured as a seven-day cardless trial.");
      const customer = await paddleFetch("/customers", { method: "POST", body: JSON.stringify({ email: identity.email, name: identity.displayName ?? identity.login, custom_data: { harikosUserId: user.supabaseUserId } }) }) as { data?: { id?: string } };
      if (!customer.data?.id) throw new Error("Paddle did not create a customer.");
      const address = await paddleFetch(`/customers/${encodeURIComponent(customer.data.id)}/addresses`, { method: "POST", body: JSON.stringify({ country_code: location.countryCode, ...(location.postalCode ? { postal_code: location.postalCode } : {}) }) }) as { data?: { id?: string } };
      if (!address.data?.id) throw new Error("Paddle did not create a billing address.");
      const response = await paddleFetch("/transactions", { method: "POST", body: JSON.stringify({ items: [{ price_id: priceId, quantity: 1 }], customer_id: customer.data.id, address_id: address.data.id, collection_mode: "automatic", status: "billed", custom_data: { harikosUserId: user.supabaseUserId, plan: selectedPlan } }) }) as { data?: { id?: string; status?: string } };
      if (!response.data?.id || response.data.status !== "paid") throw new Error("Paddle did not complete the cardless trial transaction.");
      await connection.db.update(cloudTrialReservations).set({ providerTransactionId: response.data.id, completedAt: new Date() }).where(eq(cloudTrialReservations.userId, user.id));
      return "/app/settings/billing?checkout=return";
    }
  } finally { await connection.close(); }
}
export async function createPortalSession(identity: AuthIdentity): Promise<string> {
  const { connection, user } = await cloudUser(identity);
  try {
    if (!user) throw new Error("HARIKOS user profile is not available.");
    const [subscription] = await connection.db.select().from(cloudSubscriptions).where(eq(cloudSubscriptions.userId, user.id)).orderBy(desc(cloudSubscriptions.updatedAt)).limit(1);
    if (!subscription?.providerSubscriptionId) throw new Error("No Paddle subscription exists for this account.");
    const subscriptionId = encodeURIComponent(subscription.providerSubscriptionId);
    if (subscription.status === "trialing" || subscription.status === "past_due") {
      const transaction = await paddleFetch(`/subscriptions/${subscriptionId}/update-payment-method-transaction`, { method: "GET" }) as { data?: { checkout?: { url?: string } } };
      const url = transaction.data?.checkout?.url;
      if (!url || !url.startsWith("https://")) throw new Error("Paddle did not return a payment-method checkout URL.");
      return url;
    }
    const response = await paddleFetch(`/subscriptions/${subscriptionId}`, { method: "GET" }) as { data?: { management_urls?: { update_payment_method?: string; cancel?: string } } };
    const url = response.data?.management_urls?.update_payment_method ?? response.data?.management_urls?.cancel;
    if (!url || !url.startsWith("https://")) throw new Error("Paddle did not return a subscription management URL.");
    return url;
  } finally { await connection.close(); }
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
  const plan = planFromPrice(priceId) ?? (subscription.custom_data?.plan && ["core", "pro", "scale", "enterprise"].includes(subscription.custom_data.plan) ? subscription.custom_data.plan as PaidPlan : undefined);
  if (!supabaseUserId || !plan || !subscription.customer_id || !subscription.status) throw new Error("Paddle billing event is incomplete.");
  const databaseUrl = readCloudDatabaseConfig();
  if (!databaseUrl) throw new Error("PostgreSQL is not configured.");
  const connection = await openCloudDatabase(databaseUrl, { migrate: false });
  const occurredAt = new Date(event.occurred_at ?? Date.now());
  let emailTarget: { userId: string; email: string | null } | undefined;
  let wasTrial = false;
  try { await connection.db.transaction(async (tx) => {
    const [seen] = await tx.select().from(cloudBillingWebhookEvents).where(eq(cloudBillingWebhookEvents.providerEventId, event.event_id!));
    if (seen) return;
    const [user] = await tx.select().from(cloudUsers).where(eq(cloudUsers.supabaseUserId, supabaseUserId));
    if (!user) throw new Error("HARIKOS user profile is not available for this billing event.");
    emailTarget = { userId: user.id, email: user.email };
    const status = subscription.status;
    const [existingSubscription] = await tx.select({ trialStart: cloudSubscriptions.trialStart, trialEnd: cloudSubscriptions.trialEnd }).from(cloudSubscriptions).where(eq(cloudSubscriptions.providerSubscriptionId, subscription.id));
    wasTrial = status === "trialing" || Boolean(existingSubscription?.trialStart);
    const periodStart = subscription.current_billing_period?.starts_at ?? subscription.started_at;
    const periodEnd = subscription.current_billing_period?.ends_at ?? subscription.next_billed_at;
    const values = { userId: user.id, provider: "paddle", providerCustomerId: subscription.customer_id, providerSubscriptionId: subscription.id, providerPriceId: priceId ?? null, plan, status, trialStart: status === "trialing" ? new Date(periodStart ?? Date.now()) : existingSubscription?.trialStart ?? null, trialEnd: status === "trialing" && periodEnd ? new Date(periodEnd) : existingSubscription?.trialEnd ?? null, currentPeriodStart: periodStart ? new Date(periodStart) : null, currentPeriodEnd: periodEnd ? new Date(periodEnd) : null, providerOccurredAt: occurredAt, cancelAtPeriodEnd: subscription.scheduled_change?.action === "cancel", updatedAt: new Date() };
    await tx.insert(cloudSubscriptions).values(values).onConflictDoUpdate({ target: cloudSubscriptions.providerSubscriptionId, set: values, where: or(isNull(cloudSubscriptions.providerOccurredAt), lt(cloudSubscriptions.providerOccurredAt, occurredAt)) });
    await tx.insert(cloudBillingWebhookEvents).values({ provider: "paddle", providerEventId: event.event_id!, eventType: event.event_type!, receivedAt: new Date() });
  }); } finally { await connection.close(); }
  if (emailTarget && subscription.status === "trialing") await sendAccountEmail({ userId: emailTarget.userId, to: emailTarget.email, kind: "trial_started", eventKey: `trial_started:${subscription.id}` });
  if (emailTarget && wasTrial && ["canceled", "cancelled"].includes(subscription.status)) await sendAccountEmail({ userId: emailTarget.userId, to: emailTarget.email, kind: "trial_expired", eventKey: `trial_expired:${subscription.id}` });
}
export async function requireBillingIdentity(): Promise<AuthIdentity> { const identity = await getAuthIdentity(); if (!identity) throw new Error("Authentication required."); return identity; }
