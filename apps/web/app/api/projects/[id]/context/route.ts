import { composeContextPack } from "@harikos/core";
import { NextResponse } from "next/server";
import { z } from "zod";

import { listCloudMemories, saveCloudContextPack } from "../../../../../lib/cloud-projects";
import { projectSnapshot } from "../../../../../lib/project-data";
import { getAuthIdentity } from "../../../../../lib/auth";
import { requireProductAccess, ProductAccessError, ProductQuotaError } from "../../../../../lib/entitlements";

export const runtime = "nodejs";

const requestSchema = z.object({ task: z.string().trim().min(3).max(1_000) });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getAuthIdentity();
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    await requireProductAccess(session);
    const input = requestSchema.parse(await request.json());
    const snapshot = await projectSnapshot(id);
    if (!snapshot) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    const memories = await listCloudMemories(session, id);
    const pack = composeContextPack(snapshot, input.task, () => new Date(), memories);
    await saveCloudContextPack(session, id, pack);
    return NextResponse.json(pack);
  } catch (error) {
    const invalidInput = error instanceof Error && error.name === "ZodError";
    if (error instanceof ProductAccessError) return NextResponse.json({ error: error.message, code: error.code }, { status: 402 });
    if (error instanceof ProductQuotaError) return NextResponse.json({ error: error.message, code: error.code }, { status: 429 });
    return NextResponse.json(
      { error: invalidInput ? "A task between 3 and 1,000 characters is required." : "Context generation failed." },
      { status: invalidInput ? 400 : 500 },
    );
  }
}
