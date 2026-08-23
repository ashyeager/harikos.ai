import { NextResponse } from "next/server";

import { projectSnapshot } from "../../../../../lib/project-data";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const snapshot = await projectSnapshot(id);
  return snapshot
    ? NextResponse.json({
        changes: snapshot.changes,
        contradictions: snapshot.contradictions,
      })
    : NextResponse.json({ error: "Project not found." }, { status: 404 });
}
