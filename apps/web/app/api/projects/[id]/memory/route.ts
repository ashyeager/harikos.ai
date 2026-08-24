import { NextResponse } from "next/server";

import {
  createCloudMemory,
  createCloudMemorySchema,
  listCloudMemories,
} from "../../../../../lib/cloud-projects";
import { getAuthIdentity } from "../../../../../lib/auth";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const identity = await getAuthIdentity();
  if (!identity) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  const type = new URL(request.url).searchParams.get("type") ?? undefined;
  try {
    return NextResponse.json({ memories: await listCloudMemories(identity, id, type) });
  } catch {
    return NextResponse.json({ error: "Memory could not be loaded." }, { status: 404 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const identity = await getAuthIdentity();
  if (!identity) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  try {
    const input = createCloudMemorySchema.parse(await request.json());
    return NextResponse.json({ memory: await createCloudMemory(identity, id, input) }, { status: 201 });
  } catch (error) {
    const invalid = error instanceof Error && error.name === "ZodError";
    return NextResponse.json(
      { error: invalid ? "A valid memory type and content are required." : "Memory could not be saved." },
      { status: invalid ? 400 : 404 },
    );
  }
}
