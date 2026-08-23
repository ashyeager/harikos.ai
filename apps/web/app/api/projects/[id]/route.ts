import { NextResponse } from "next/server";

import { projectSnapshot } from "../../../../lib/project-data";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const snapshot = await projectSnapshot(id);
    return snapshot
      ? NextResponse.json(snapshot)
      : NextResponse.json({ error: "Project not found." }, { status: 404 });
  } catch {
    return NextResponse.json(
      { error: "Project lookup failed." },
      { status: 500 },
    );
  }
}
