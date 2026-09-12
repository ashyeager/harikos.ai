import { and, cloudSubscriptions, cloudUsers, eq, gte, lt, openCloudDatabase, readCloudDatabaseConfig } from "@harikos/db";
import { NextResponse } from "next/server";

import { sendAccountEmail } from "../../../../lib/email";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const config = readCloudDatabaseConfig();
  if (!config) return NextResponse.json({ error: "Storage unavailable." }, { status: 503 });
  const now = new Date(), cutoff = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const connection = await openCloudDatabase(config, { migrate: false });
  try {
    const trials = await connection.db.select({ subscriptionId: cloudSubscriptions.id, userId: cloudUsers.id, email: cloudUsers.email }).from(cloudSubscriptions).innerJoin(cloudUsers, eq(cloudSubscriptions.userId, cloudUsers.id)).where(and(eq(cloudSubscriptions.status, "trialing"), gte(cloudSubscriptions.trialEnd, now), lt(cloudSubscriptions.trialEnd, cutoff)));
    await Promise.all(trials.map((trial) => sendAccountEmail({ userId: trial.userId, to: trial.email, kind: "trial_ending", eventKey: `trial_ending:${trial.subscriptionId}` })));
    return NextResponse.json({ checked: trials.length });
  } finally { await connection.close(); }
}
