import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { findCloudProjectByRepositoryId, scanCloudProjectFromWebhook } from "../../../../lib/cloud-projects";

export const runtime = "nodejs";

function validSignature(payload: string, received: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
  if (!secret || !received?.startsWith("sha256=")) return false;
  const expected = Buffer.from(`sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`);
  const actual = Buffer.from(received);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function POST(request: Request) {
  const payload = await request.text();
  if (!validSignature(payload, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Invalid GitHub webhook signature." }, { status: 401 });
  }
  if (request.headers.get("x-github-event") !== "push") return NextResponse.json({ received: true });
  try {
    const body = JSON.parse(payload) as { repository?: { id?: number } };
    const repositoryId = body.repository?.id;
    if (!repositoryId) return NextResponse.json({ error: "Repository ID is missing." }, { status: 400 });
    const projectId = await findCloudProjectByRepositoryId(String(repositoryId));
    if (!projectId) return NextResponse.json({ received: true, matched: false });
    await scanCloudProjectFromWebhook(projectId);
    return NextResponse.json({ received: true, matched: true });
  } catch {
    return NextResponse.json({ error: "GitHub webhook processing failed." }, { status: 500 });
  }
}