import { NextResponse } from "next/server";

import { scanCloudProject } from "../../../../../lib/cloud-projects";
import { getAuthIdentity } from "../../../../../lib/auth";
import { ProductAccessError } from "../../../../../lib/entitlements";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await getAuthIdentity();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return NextResponse.json(await scanCloudProject(session, id));
  } catch (error) {
    if (error instanceof ProductAccessError) return NextResponse.json({ error: error.message, code: error.code }, { status: 402 });
    return NextResponse.json(
      { error: "Repository scan failed." },
      { status: 500 },
    );
  }
}
