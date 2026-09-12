import {
  and,
  cloudAgentConnections,
  cloudContextPacks,
  cloudMemories,
  cloudOutcomes,
  cloudProjects,
  cloudScans,
  cloudSubscriptions,
  cloudUsers,
  count,
  desc,
  eq,
  isNull,
  openCloudDatabase,
  readCloudDatabaseConfig,
  sql,
} from "@harikos/db";

import type { AuthIdentity } from "./auth";

export const PLAN_CONFIG = {
  free: { name: "HARIKOS Free", monthlyUsd: 0, projectLimit: 1, agentLimit: 1, scanLimit: 1, contextPackLimit: 3, memoryWriteLimit: 10, continuousReverification: false },
  core: { name: "HARIKOS Core", monthlyUsd: 9, projectLimit: 1, agentLimit: 1, scanLimit: 100, contextPackLimit: 250, memoryWriteLimit: 1_000, continuousReverification: true },
  pro: { name: "HARIKOS Pro", monthlyUsd: 29, projectLimit: 5, agentLimit: 5, scanLimit: 500, contextPackLimit: 1_000, memoryWriteLimit: 5_000, continuousReverification: true },
  scale: { name: "HARIKOS Scale", monthlyUsd: 79, projectLimit: 20, agentLimit: 20, scanLimit: 2_500, contextPackLimit: 5_000, memoryWriteLimit: 25_000, continuousReverification: true },
  enterprise: { name: "HARIKOS Enterprise", monthlyUsd: null, projectLimit: 1000, agentLimit: 1000, scanLimit: 10_000, contextPackLimit: 20_000, memoryWriteLimit: 100_000, continuousReverification: true },
} as const;

export const TRIAL_DAYS = 7;
export type Plan = keyof typeof PLAN_CONFIG;
export type PaidPlan = Exclude<Plan, "free">;
export type EntitlementStatus = "developer" | "free" | "trialing" | "active" | "past_due" | "canceled" | "expired" | "inactive";
export type Entitlement = { role: "developer" | "customer"; plan: Plan; status: EntitlementStatus; hasAccess: boolean; projectLimit: number; agentLimit: number; scanLimit: number; contextPackLimit: number; memoryWriteLimit: number; continuousReverification: boolean; trialEndsAt: string | null; periodEndsAt: string | null };
export type PlanUsage = { activeProjects: number; activeAgents: number; manualScansThisMonth: number; contextPacksThisMonth: number; memoryWritesThisMonth: number; monthStartsAt: string };

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
export function calendarMonthStart(now = new Date()): Date { return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)); }
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
function entitlementFor(plan: Plan, role: "developer" | "customer", status: EntitlementStatus, trialEndsAt: string | null = null, periodEndsAt: string | null = null): Entitlement {
  return { role, plan, status, hasAccess: true, ...PLAN_CONFIG[plan], trialEndsAt, periodEndsAt };
}
export function freeEntitlement(): Entitlement { return entitlementFor("free", "customer", "free"); }
function developerEntitlement(): Entitlement {
  return { ...entitlementFor("enterprise", "developer", "developer"), projectLimit: Number.MAX_SAFE_INTEGER, agentLimit: Number.MAX_SAFE_INTEGER, scanLimit: Number.MAX_SAFE_INTEGER, contextPackLimit: Number.MAX_SAFE_INTEGER, memoryWriteLimit: Number.MAX_SAFE_INTEGER };
}
function paidEntitlement(plan: PaidPlan, status: EntitlementStatus, trialEndsAt: string | null, periodEndsAt: string | null): Entitlement {
  return entitlementFor(plan, "customer", status, trialEndsAt, periodEndsAt);
}
export function assertQuotaLimit(used: number, limit: number, message: string): void {
  if (used >= limit) throw new ProductQuotaError(message);
}
export function assertScanQuota(entitlement: Entitlement, completedScans: number, completedScansThisMonth: number): void {
  if (completedScans === 0) return;
  assertQuotaLimit(completedScansThisMonth, entitlement.scanLimit, "Your plan's manual rescan limit for this calendar month has been reached.");
}
export function pushHandlingFor(entitlement: Entitlement): "scan" | "mark_refresh_required" {
  return entitlement.continuousReverification ? "scan" : "mark_refresh_required";
}
type SubscriptionEntitlementRecord = { role?: string | null; plan?: string | null; status?: string | null; trialEnd?: Date | null; currentPeriodEnd?: Date | null };
export function entitlementFromSubscription(record: SubscriptionEntitlementRecord | undefined, now = new Date()): Entitlement {
  if (record?.role === "developer") return developerEntitlement();
  if (!record || !record.plan || !(record.plan in PLAN_CONFIG) || record.plan === "free") return freeEntitlement();
  const status = normalizeSubscriptionStatus(record.status);
  const validUntil = status === "trialing" ? record.trialEnd : record.currentPeriodEnd;
  if (!(status === "trialing" || status === "active") || !validUntil || validUntil <= now) return freeEntitlement();
  return paidEntitlement(record.plan as PaidPlan, status, record.trialEnd?.toISOString() ?? null, record.currentPeriodEnd?.toISOString() ?? null);
}

export async function resolveEntitlement(identity: Pick<AuthIdentity, "id">): Promise<Entitlement> {
  if (isDeveloperUser(identity.id)) return developerEntitlement();
  const databaseUrl = readCloudDatabaseConfig();
  if (!databaseUrl) return freeEntitlement();
  const connection = await openCloudDatabase(databaseUrl, { migrate: false });
  try {
    const [record] = await connection.db.select({ role: cloudUsers.role, plan: cloudSubscriptions.plan, status: cloudSubscriptions.status, trialEnd: cloudSubscriptions.trialEnd, currentPeriodEnd: cloudSubscriptions.currentPeriodEnd }).from(cloudUsers).leftJoin(cloudSubscriptions, eq(cloudSubscriptions.userId, cloudUsers.id)).where(eq(cloudUsers.supabaseUserId, identity.id)).orderBy(desc(cloudSubscriptions.updatedAt)).limit(1);
    return entitlementFromSubscription(record);
  } finally { await connection.close(); }
}
export async function requireProductAccess(identity: Pick<AuthIdentity, "id">): Promise<Entitlement> { const entitlement = await resolveEntitlement(identity); if (!entitlement.hasAccess) throw new ProductAccessError(); return entitlement; }
export async function getPlanUsage(identity: Pick<AuthIdentity, "id">, now = new Date()): Promise<PlanUsage> {
  const databaseUrl = readCloudDatabaseConfig(); if (!databaseUrl) throw new ProductAccessError("HARIKOS storage is not configured."); const connection = await openCloudDatabase(databaseUrl, { migrate: false });
  const monthStart = calendarMonthStart(now);
  try {
    const [projects, agents, scans, contextPacks, memories, outcomes] = await Promise.all([
      connection.db.select({ value: count() }).from(cloudProjects).innerJoin(cloudUsers, eq(cloudProjects.ownerId, cloudUsers.id)).where(eq(cloudUsers.supabaseUserId, identity.id)),
      connection.db.select({ value: count() }).from(cloudAgentConnections).innerJoin(cloudProjects, eq(cloudAgentConnections.projectId, cloudProjects.id)).innerJoin(cloudUsers, eq(cloudProjects.ownerId, cloudUsers.id)).where(and(eq(cloudUsers.supabaseUserId, identity.id), isNull(cloudAgentConnections.revokedAt))),
      connection.db.select({ value: count() }).from(cloudScans).innerJoin(cloudProjects, eq(cloudScans.projectId, cloudProjects.id)).innerJoin(cloudUsers, eq(cloudProjects.ownerId, cloudUsers.id)).where(and(eq(cloudUsers.supabaseUserId, identity.id), eq(cloudScans.status, "completed"), eq(cloudScans.initial, false), sql`${cloudScans.startedAt} >= ${monthStart}`)),
      connection.db.select({ value: count() }).from(cloudContextPacks).innerJoin(cloudProjects, eq(cloudContextPacks.projectId, cloudProjects.id)).innerJoin(cloudUsers, eq(cloudProjects.ownerId, cloudUsers.id)).where(and(eq(cloudUsers.supabaseUserId, identity.id), sql`${cloudContextPacks.createdAt} >= ${monthStart}`)),
      connection.db.select({ value: count() }).from(cloudMemories).innerJoin(cloudProjects, eq(cloudMemories.projectId, cloudProjects.id)).innerJoin(cloudUsers, eq(cloudProjects.ownerId, cloudUsers.id)).where(and(eq(cloudUsers.supabaseUserId, identity.id), sql`${cloudMemories.createdAt} >= ${monthStart}`)),
      connection.db.select({ value: count() }).from(cloudOutcomes).innerJoin(cloudProjects, eq(cloudOutcomes.projectId, cloudProjects.id)).innerJoin(cloudUsers, eq(cloudProjects.ownerId, cloudUsers.id)).where(and(eq(cloudUsers.supabaseUserId, identity.id), sql`${cloudOutcomes.createdAt} >= ${monthStart}`)),
    ]);
    return { activeProjects: Number(projects[0]?.value ?? 0), activeAgents: Number(agents[0]?.value ?? 0), manualScansThisMonth: Number(scans[0]?.value ?? 0), contextPacksThisMonth: Number(contextPacks[0]?.value ?? 0), memoryWritesThisMonth: Number(memories[0]?.value ?? 0) + Number(outcomes[0]?.value ?? 0), monthStartsAt: monthStart.toISOString() };
  } finally { await connection.close(); }
}
export async function requireProjectQuota(identity: Pick<AuthIdentity, "id">): Promise<Entitlement> {
  const entitlement = await requireProductAccess(identity); const usage = await getPlanUsage(identity); assertQuotaLimit(usage.activeProjects, entitlement.projectLimit, "Your plan's active project limit has been reached."); return entitlement;
}
export async function requireAgentQuota(identity: Pick<AuthIdentity, "id">): Promise<Entitlement> {
  const entitlement = await requireProductAccess(identity); const usage = await getPlanUsage(identity); assertQuotaLimit(usage.activeAgents, entitlement.agentLimit, "Your plan's active agent connection limit has been reached."); return entitlement;
}

export async function requireScanQuota(identity: Pick<AuthIdentity, "id">, projectId: string, now = new Date()): Promise<Entitlement & { initialScan: boolean }> {
  const entitlement = await requireProductAccess(identity); const usage = await getPlanUsage(identity, now); const databaseUrl = readCloudDatabaseConfig(); if (!databaseUrl) throw new ProductAccessError("HARIKOS storage is not configured."); const connection = await openCloudDatabase(databaseUrl, { migrate: false });
  try {
    const [allScans] = await connection.db.select({ value: count() }).from(cloudScans).where(and(eq(cloudScans.projectId, projectId), eq(cloudScans.status, "completed")));
    const completedScans = Number(allScans?.value ?? 0);
    assertScanQuota(entitlement, completedScans, usage.manualScansThisMonth); return { ...entitlement, initialScan: completedScans === 0 };
  } finally { await connection.close(); }
}
export async function requireContextPackQuota(identity: Pick<AuthIdentity, "id">, now = new Date()): Promise<Entitlement> {
  const entitlement = await requireProductAccess(identity); const usage = await getPlanUsage(identity, now); assertQuotaLimit(usage.contextPacksThisMonth, entitlement.contextPackLimit, "Your plan's context pack limit for this calendar month has been reached."); return entitlement;
}
export async function requireMemoryWriteQuota(identity: Pick<AuthIdentity, "id">, now = new Date()): Promise<Entitlement> {
  const entitlement = await requireProductAccess(identity); const usage = await getPlanUsage(identity, now); assertQuotaLimit(usage.memoryWritesThisMonth, entitlement.memoryWriteLimit, "Your plan's memory write limit for this calendar month has been reached."); return entitlement;
}
