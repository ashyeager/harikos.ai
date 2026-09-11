import { NextResponse } from "next/server";

import { projectSnapshot } from "../../../../lib/project-data";
import { getAuthIdentity } from "../../../../lib/auth";
import { ProductAccessError, requireProductAccess } from "../../../../lib/entitlements";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const identity = await getAuthIdentity();
    if (!identity) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    await requireProductAccess(identity);
    const snapshot = await projectSnapshot(id);
    return snapshot
      ? NextResponse.json(snapshot)
      : NextResponse.json({ error: "Project not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof ProductAccessError) return NextResponse.json({ error: error.message, code: error.code }, { status: 402 });
    return NextResponse.json(
      { error: "Project lookup failed." },
      { status: 500 },
    );
  }
}
