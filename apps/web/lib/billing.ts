import Stripe from "stripe";
import { cloudSubscriptions, cloudUsers, eq, openCloudDatabase, readCloudDatabaseConfig } from "@harikos/db";

import { getAuthIdentity, type AuthIdentity } from "./auth";

function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("Stripe is not configured.");
  return new Stripe(key);
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

async function userRecord(identity: AuthIdentity) {
  const databaseUrl = readCloudDatabaseConfig();
  if (!databaseUrl) throw new Error("PostgreSQL is not configured.");
  const connection = await openCloudDatabase(databaseUrl, { migrate: false });
  const [user] = await connection.db.select().from(cloudUsers).where(eq(cloudUsers.supabaseUserId, identity.id));
  return { connection, user };
}

export async function createCheckoutSession(identity: AuthIdentity): Promise<string> {

  const { connection, user } = await userRecord(identity);
  try {
    if (!user) throw new Error("HARIKOS user profile is not available.");
    const client = stripe();
    const [existing] = await connection.db.select().from(cloudSubscriptions).where(eq(cloudSubscriptions.userId, user.id));
    const customer = existing
      ? await client.customers.retrieve(existing.stripeCustomerId)
      : await client.customers.create({ ...(identity.email ? { email: identity.email } : {}), ...(identity.displayName ? { name: identity.displayName } : {}), metadata: { harikosUserId: user.id } });
    if (customer.deleted) throw new Error("Stripe customer is unavailable.");
    const session = await client.checkout.sessions.create({ mode: "subscription", customer: customer.id, line_items: [{ price_data: { currency: "usd", unit_amount: 100, recurring: { interval: "month" }, product_data: { name: "HARIKOS Pro" } }, quantity: 1 }], integration_identifier: `harikos_pro_${Math.random().toString(36).slice(2, 10)}`, success_url: `${appUrl()}/app/settings/billing?checkout=complete`, cancel_url: `${appUrl()}/app/settings/billing?checkout=cancelled` });
    if (!existing) {
      await connection.db.insert(cloudSubscriptions).values({ userId: user.id, stripeCustomerId: customer.id, status: "checkout_pending" });
    }
    return session.url ?? (() => { throw new Error("Stripe did not return a Checkout URL."); })();
  } finally { await connection.close(); }
}

export async function createPortalSession(identity: AuthIdentity): Promise<string> {
  const { connection, user } = await userRecord(identity);
  try {
    if (!user) throw new Error("HARIKOS user profile is not available.");
    const [subscription] = await connection.db.select().from(cloudSubscriptions).where(eq(cloudSubscriptions.userId, user.id));
    if (!subscription) throw new Error("No Stripe customer exists for this account.");
    return (await stripe().billingPortal.sessions.create({ customer: subscription.stripeCustomerId, return_url: `${appUrl()}/app/settings/billing` })).url;
  } finally { await connection.close(); }
}

export async function handleStripeWebhook(payload: string, signature: string): Promise<void> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) throw new Error("Stripe webhook is not configured.");
  const event = stripe().webhooks.constructEvent(payload, signature, secret);
  if (!["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) return;
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const databaseUrl = readCloudDatabaseConfig();
  if (!databaseUrl) throw new Error("PostgreSQL is not configured.");
  const connection = await openCloudDatabase(databaseUrl, { migrate: false });
  try {
    const [user] = await connection.db.select().from(cloudUsers).innerJoin(cloudSubscriptions, eq(cloudUsers.id, cloudSubscriptions.userId)).where(eq(cloudSubscriptions.stripeCustomerId, customerId));
    if (!user) return;
    const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
    await connection.db.update(cloudSubscriptions).set({ stripeSubscriptionId: subscription.id, stripePriceId: priceId, status: subscription.status, ...(currentPeriodEnd ? { currentPeriodEnd: new Date(currentPeriodEnd * 1000) } : {}), cancelAtPeriodEnd: subscription.cancel_at_period_end, updatedAt: new Date() }).where(eq(cloudSubscriptions.stripeCustomerId, customerId));
  } finally { await connection.close(); }
}

export async function requireBillingIdentity(): Promise<AuthIdentity> {
  const identity = await getAuthIdentity();
  if (!identity) throw new Error("Authentication required.");
  return identity;
}
