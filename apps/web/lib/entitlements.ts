export type Plan = "free" | "pro";

export type Entitlements = {
  maxProjects: number;
  maxAgentConnections: number;
  maxMemoriesPerProject: number;
  maxContextPacksPerMonth: number;
};

export const ENTITLEMENTS: Record<Plan, Entitlements> = {
  free: {
    maxProjects: 1,
    maxAgentConnections: 1,
    maxMemoriesPerProject: 250,
    maxContextPacksPerMonth: 25,
  },
  pro: {
    maxProjects: 5,
    maxAgentConnections: 5,
    maxMemoriesPerProject: 2_500,
    maxContextPacksPerMonth: 250,
  },
};

export function planFromSubscriptionStatus(status: string | undefined): Plan {
  return status === "active" || status === "trialing" ? "pro" : "free";
}