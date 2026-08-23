import { scanAndPersistLocalProject } from "@harikos/core";
import { NextResponse } from "next/server";

import { scanCloudProject } from "../../../../../lib/cloud-projects";
import {
  isLocalDemoEnabled,
  localRepositoryPath,
} from "../../../../../lib/config";
import { getAuthIdentity } from "../../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    if (id === "local-harikos") {
      if (!isLocalDemoEnabled()) {
        return NextResponse.json(
          { error: "Local repository scanning is disabled." },
          { status: 403 },
        );
      }
      const snapshot = await scanAndPersistLocalProject(localRepositoryPath());
      return NextResponse.json({ ...snapshot, projectId: "local-harikos" });
    }
    const session = await getAuthIdentity();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return NextResponse.json(await scanCloudProject(session, id));
  } catch {
    return NextResponse.json(
      { error: "Repository scan failed." },
      { status: 500 },
    );
  }
}
