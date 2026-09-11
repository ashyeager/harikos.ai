import { NextResponse } from "next/server";

import { projectSnapshot } from "../../../../../lib/project-data";
import { getAuthIdentity } from "../../../../../lib/auth";
import { requireProductAccess } from "../../../../../lib/entitlements";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const identity = await getAuthIdentity();
  if (!identity) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try { await requireProductAccess(identity); } catch { return NextResponse.json({ error: "An active HARIKOS subscription or trial is required.", code: "PAYMENT_REQUIRED" }, { status: 402 }); }
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  return snapshot
    ? NextResponse.json({
        changes: snapshot.changes,
        contradictions: snapshot.contradictions,
      })
    : NextResponse.json({ error: "Project not found." }, { status: 404 });
}
