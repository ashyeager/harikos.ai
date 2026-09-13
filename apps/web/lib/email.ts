import { cloudEmailEvents, eq, openCloudDatabase, readCloudDatabaseConfig } from "@harikos/db";

type EmailKind = "welcome" | "trial_started" | "trial_ending" | "trial_expired";
const copy: Record<EmailKind, { subject: string; heading: string; body: string }> = {
  welcome: { subject: "Welcome to HARIKOS", heading: "Your project state starts here.", body: "Connect a repository, inspect what the evidence supports, and give every coding agent the same current context." },
  trial_started: { subject: "Your HARIKOS Pro trial has started", heading: "Pro is active for seven days.", body: "Explore the larger project and agent capacity. Add a payment method in billing if you want Pro to continue." },
  trial_ending: { subject: "Your HARIKOS Pro trial is ending", heading: "Your Pro trial ends soon.", body: "Add a payment method in billing to keep Pro capacity. Your project data remains available if you return to Free." },
  trial_expired: { subject: "Your HARIKOS Pro trial ended", heading: "Your workspace remains available on Free.", body: "Your projects, Truth, Evidence, and Memory remain intact. Upgrade whenever you need Pro capacity again." },
};

export async function sendAccountEmail(input: { userId: string; to: string | null; kind: EmailKind; eventKey: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim(), from = process.env.RESEND_FROM_EMAIL?.trim(), databaseUrl = readCloudDatabaseConfig();
  if (!apiKey || !from || !databaseUrl || !input.to) return;
  const connection = await openCloudDatabase(databaseUrl, { migrate: false });
  try {
    const [existing] = await connection.db.select({ id: cloudEmailEvents.id }).from(cloudEmailEvents).where(eq(cloudEmailEvents.eventKey, input.eventKey));
    if (existing) return;
    const message = copy[input.kind];
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": input.eventKey }, body: JSON.stringify({ from, to: [input.to], subject: message.subject, html: `<div style="font-family:Arial,sans-serif;background:#f6f6f3;color:#171717;padding:40px"><h1>${message.heading}</h1><p>${message.body}</p><p><a href="https://harikos-ai.vercel.app/app/projects">Open HARIKOS</a></p></div>` }) });
    if (!response.ok) throw new Error("Resend delivery failed.");
    await connection.db.insert(cloudEmailEvents).values({ userId: input.userId, eventKey: input.eventKey, eventType: input.kind }).onConflictDoNothing();
  } catch { /* Email is intentionally fail-soft and retries on the next lifecycle event. */ }
  finally { await connection.close(); }
}
