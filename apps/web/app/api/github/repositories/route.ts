import { NextResponse } from "next/server";

import { getAuthIdentity } from "../../../../lib/auth";
import { listAuthorizedRepositories } from "../../../../lib/cloud-projects";

export const runtime = "nodejs";

export async function GET() {
  const identity = await getAuthIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const repositories = await listAuthorizedRepositories(identity);
    return NextResponse.json(
      { repositories },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "GitHub repository lookup failed.",
      },
      { status: 502 },
    );
  }
}
