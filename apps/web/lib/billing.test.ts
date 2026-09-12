import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { canStartProTrial, verifyPaddleWebhook } from "./billing";

describe("Pro trial eligibility", () => {
  it("allows one trial per account", () => {
    expect(canStartProTrial([])).toBe(true);
    expect(canStartProTrial([{ status: "canceled", trialStart: new Date("2026-09-01T00:00:00Z") }])).toBe(false);
    expect(canStartProTrial([{ status: "active", trialStart: null }])).toBe(false);
  });
});

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
