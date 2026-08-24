import { NextResponse } from "next/server";

import {
  createAgentConnection,
  createAgentConnectionSchema,
  listAgentConnections,
  revokeAgentConnection,
} from "../../../../../lib/cloud-projects";
import { getAuthIdentity } from "../../../../../lib/auth";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAuthIdentity();
  if (!identity) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const { id } = await params;
    return NextResponse.json({ connections: await listAgentConnections(identity, id) });
  } catch {
    return NextResponse.json({ error: "Agent connections could not be loaded." }, { status: 404 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAuthIdentity();
  if (!identity) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const { id } = await params;
    const { name } = createAgentConnectionSchema.parse(await request.json());
    return NextResponse.json(await createAgentConnection(identity, id, name), { status: 201 });
  } catch (error) {
    const invalid = error instanceof Error && error.name === "ZodError";
    return NextResponse.json({ error: invalid ? "A connection name is required." : "Agent connection could not be created." }, { status: invalid ? 400 : 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const identity = await getAuthIdentity();
  if (!identity) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const connectionId = new URL(request.url).searchParams.get("connectionId");
  if (!connectionId) return NextResponse.json({ error: "A connection ID is required." }, { status: 400 });
  try {
    await revokeAgentConnection(identity, (await params).id, connectionId);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Agent connection could not be revoked." }, { status: 404 });
  }
}
