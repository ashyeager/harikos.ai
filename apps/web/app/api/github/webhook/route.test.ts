import { createHmac } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";

import { POST } from "./route";

const originalSecret = process.env.GITHUB_WEBHOOK_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.GITHUB_WEBHOOK_SECRET;
  } else {
    process.env.GITHUB_WEBHOOK_SECRET = originalSecret;
  }
});

function request(payload: string, event: string, signature: string): Request {
  return new Request("http://localhost/api/github/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-github-event": event,
      "x-hub-signature-256": signature,
    },
    body: payload,
  });
}

function sign(payload: string, secret: string): string {
  return `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

describe("GitHub webhook boundary", () => {
  it("rejects an invalid signature before processing the event", async () => {
    process.env.GITHUB_WEBHOOK_SECRET = "acceptance-webhook-secret";
    const response = await POST(request("{}", "ping", "sha256=invalid"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid GitHub webhook signature.",
    });
  });

  it("accepts a correctly signed non-push event without touching the database", async () => {
    const secret = "acceptance-webhook-secret";
    const payload = JSON.stringify({ zen: "Keep it logically awesome." });
    process.env.GITHUB_WEBHOOK_SECRET = secret;
    const response = await POST(request(payload, "ping", sign(payload, secret)));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
  });

  it("rejects a correctly signed push without a repository identifier", async () => {
    const secret = "acceptance-webhook-secret";
    const payload = JSON.stringify({ repository: {} });
    process.env.GITHUB_WEBHOOK_SECRET = secret;
    const response = await POST(request(payload, "push", sign(payload, secret)));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Repository ID is missing.",
    });
  });
});
