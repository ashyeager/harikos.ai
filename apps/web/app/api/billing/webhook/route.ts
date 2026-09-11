import { NextResponse } from "next/server";
import { handlePaddleWebhook } from "../../../../lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("paddle-signature");
  if (!signature) return NextResponse.json({ error: "Missing Paddle signature." }, { status: 400 });
  try { await handlePaddleWebhook(await request.text(), signature); return NextResponse.json({ received: true }); }
  catch { return NextResponse.json({ error: "Invalid Paddle webhook." }, { status: 400 }); }
}
