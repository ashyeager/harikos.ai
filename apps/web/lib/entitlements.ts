import {
  and,
  cloudAgentConnections,
  cloudProjects,
  cloudSubscriptions,
  cloudUsers,
  count,
  desc,
  eq,
  isNull,
  openCloudDatabase,
  readCloudDatabaseConfig,
} from "@harikos/db";

import type { AuthIdentity } from "./auth";

export const PLAN_CONFIG = {
  core: { name: "HARIKOS Core", monthlyUsd: 9, projectLimit: 1, agentLimit: 1 },
  pro: { name: "HARIKOS Pro", monthlyUsd: 29, projectLimit: 5, agentLimit: 5 },
  scale: { name: "HARIKOS Scale", monthlyUsd: 79, projectLimit: 20, agentLimit: 20 },
  enterprise: { name: "HARIKOS Enterprise", monthlyUsd: null, projectLimit: 1000, agentLimit: 1000 },
} as const;

export const TRIAL_DAYS = 7;
export type Plan = keyof typeof PLAN_CONFIG;
export type EntitlementStatus = "developer" | "trialing" | "active" | "past_due" | "canceled" | "expired" | "inactive";
export type Entitlement = { role: "developer" | "customer"; plan: Plan | null; status: EntitlementStatus; hasAccess: boolean; projectLimit: number; agentLimit: number; trialEndsAt: string | null; periodEndsAt: string | null };

export class ProductAccessError extends Error {
  readonly code = "PAYMENT_REQUIRED";
  constructor(message = "An active HARIKOS subscription or trial is required.") { super(message); this.name = "ProductAccessError"; }
}
export class ProductQuotaError extends Error {
  readonly code = "QUOTA_EXCEEDED";
  constructor(message: string) { super(message); this.name = "ProductQuotaError"; }
}

function developerIds(environment: NodeJS.ProcessEnv = process.env): Set<string> {
  return new Set((environment.HARIKOS_DEVELOPER_USER_IDS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter((value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(value)));
}
export function isDeveloperUser(userId: string, environment: NodeJS.ProcessEnv = process.env): boolean { return developerIds(environment).has(userId.toLowerCase()); }
export function normalizeSubscriptionStatus(status: string | null | undefined): EntitlementStatus {
  switch (status?.toLowerCase()) {
    case "trialing": return "trialing";
    case "active": return "active";
    case "past_due": return "past_due";
    case "canceled": case "cancelled": return "canceled";
    case "expired": return "expired";
    default: return "inactive";
  }
}
function inactiveEntitlement(): Entitlement { return { role: "customer", plan: null, status: "inactive", hasAccess: false, projectLimit: 0, agentLimit: 0, trialEndsAt: null, periodEndsAt: null }; }

export async function resolveEntitlement(identity: Pick<AuthIdentity, "id">): Promise<Entitlement> {
  if (isDeveloperUser(identity.id)) return { role: "developer", plan: "enterprise", status: "developer", hasAccess: true, projectLimit: PLAN_CONFIG.enterprise.projectLimit, agentLimit: PLAN_CONFIG.enterprise.agentLimit, trialEndsAt: null, periodEndsAt: null };
  const databaseUrl = readCloudDatabaseConfig();
  if (!databaseUrl) return inactiveEntitlement();
  const connection = await openCloudDatabase(databaseUrl, { migrate: false });
  try {
    const [record] = await connection.db.select({ role: cloudUsers.role, plan: cloudSubscriptions.plan, status: cloudSubscriptions.status, trialEnd: cloudSubscriptions.trialEnd, currentPeriodEnd: cloudSubscriptions.currentPeriodEnd }).from(cloudUsers).leftJoin(cloudSubscriptions, eq(cloudSubscriptions.userId, cloudUsers.id)).where(eq(cloudUsers.supabaseUserId, identity.id)).orderBy(desc(cloudSubscriptions.updatedAt)).limit(1);
    if (record?.role === "developer") return { role: "developer", plan: "enterprise", status: "developer", hasAccess: true, projectLimit: PLAN_CONFIG.enterprise.projectLimit, agentLimit: PLAN_CONFIG.enterprise.agentLimit, trialEndsAt: null, periodEndsAt: null };
    if (!record || !record.plan || !(record.plan in PLAN_CONFIG)) return inactiveEntitlement();
    const status = normalizeSubscriptionStatus(record.status);
    const validUntil = status === "trialing" ? record.trialEnd : record.currentPeriodEnd;
    const hasAccess = (status === "trialing" || status === "active") && Boolean(validUntil && validUntil > new Date());
    const plan = record.plan as Plan;
    return { role: "customer", plan, status: hasAccess ? status : status === "trialing" || status === "active" ? "expired" : status, hasAccess, projectLimit: hasAccess ? PLAN_CONFIG[plan].projectLimit : 0, agentLimit: hasAccess ? PLAN_CONFIG[plan].agentLimit : 0, trialEndsAt: record.trialEnd?.toISOString() ?? null, periodEndsAt: record.currentPeriodEnd?.toISOString() ?? null };
  } finally { await connection.close(); }
}
export async function requireProductAccess(identity: Pick<AuthIdentity, "id">): Promise<Entitlement> { const entitlement = await resolveEntitlement(identity); if (!entitlement.hasAccess) throw new ProductAccessError(); return entitlement; }
export async function requireProjectQuota(identity: Pick<AuthIdentity, "id">): Promise<Entitlement> {
  const entitlement = await requireProductAccess(identity); const databaseUrl = readCloudDatabaseConfig(); if (!databaseUrl) throw new ProductAccessError("HARIKOS storage is not configured."); const connection = await openCloudDatabase(databaseUrl, { migrate: false });
  try { const [usage] = await connection.db.select({ value: count() }).from(cloudProjects).innerJoin(cloudUsers, eq(cloudProjects.ownerId, cloudUsers.id)).where(eq(cloudUsers.supabaseUserId, identity.id)); if (Number(usage?.value ?? 0) >= entitlement.projectLimit) throw new ProductQuotaError("Your plan's active project limit has been reached."); return entitlement; } finally { await connection.close(); }
}
export async function requireAgentQuota(identity: Pick<AuthIdentity, "id">): Promise<Entitlement> {
  const entitlement = await requireProductAccess(identity); const databaseUrl = readCloudDatabaseConfig(); if (!databaseUrl) throw new ProductAccessError("HARIKOS storage is not configured."); const connection = await openCloudDatabase(databaseUrl, { migrate: false });
  try { const [usage] = await connection.db.select({ value: count() }).from(cloudAgentConnections).innerJoin(cloudProjects, eq(cloudAgentConnections.projectId, cloudProjects.id)).innerJoin(cloudUsers, eq(cloudProjects.ownerId, cloudUsers.id)).where(and(eq(cloudUsers.supabaseUserId, identity.id), isNull(cloudAgentConnections.revokedAt))); if (Number(usage?.value ?? 0) >= entitlement.agentLimit) throw new ProductQuotaError("Your plan's active agent connection limit has been reached."); return entitlement; } finally { await connection.close(); }
}
