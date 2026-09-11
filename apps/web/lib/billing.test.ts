import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { verifyPaddleWebhook } from "./billing";

describe("Paddle webhook signature boundary", () => {
  it("accepts a valid raw-body signature and rejects tampering", () => {
    const body = '{"event_id":"evt_1"}';
    const secret = "pdl_ntfset_test";
    const timestamp = "1778198400";
    const signature = createHmac("sha256", secret).update(`${timestamp}:${body}`).digest("hex");
    expect(verifyPaddleWebhook(body, `ts=${timestamp};h1=${signature}`, secret, Number(timestamp) * 1000)).toBe(true);
    expect(verifyPaddleWebhook(`${body} `, `ts=${timestamp};h1=${signature}`, secret, Number(timestamp) * 1000)).toBe(false);
    expect(verifyPaddleWebhook(body, `ts=${timestamp};h1=${signature}`, secret, Number(timestamp) * 1000 + 5_001)).toBe(false);
  });
});
