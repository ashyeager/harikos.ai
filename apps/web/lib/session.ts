import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import { cookies } from "next/headers";
import { z } from "zod";

export const SESSION_COOKIE = "harikos_session";

export const webSessionSchema = z.object({
  user: z.object({
    githubUserId: z.string().min(1),
    login: z.string().min(1),
    name: z.string().nullable(),
    avatarUrl: z.string().url().nullable(),
  }),
  accessToken: z.string().min(1),
  expiresAt: z.string().datetime({ offset: true }),
});

export type WebSession = z.infer<typeof webSessionSchema>;

function sessionKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

function readSecret(environment: NodeJS.ProcessEnv = process.env): string | undefined {
  const secret = environment.HARIKOS_SESSION_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : undefined;
}

export function sealSession(
  session: WebSession,
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const secret = readSecret(environment);
  if (!secret) {
    throw new Error("HARIKOS_SESSION_SECRET must contain at least 32 characters.");
  }
  const parsed = webSessionSchema.parse(session);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sessionKey(secret), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(parsed), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function unsealSession(
  value: string,
  environment: NodeJS.ProcessEnv = process.env,
): WebSession | undefined {
  const secret = readSecret(environment);
  if (!secret) {
    return undefined;
  }
  try {
    const payload = Buffer.from(value, "base64url");
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", sessionKey(secret), iv);
    decipher.setAuthTag(tag);
    const decoded = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
    const session = webSessionSchema.parse(JSON.parse(decoded) as unknown);
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      return undefined;
    }
    return session;
  } catch {
    return undefined;
  }
}

export async function getWebSession(): Promise<WebSession | undefined> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return value ? unsealSession(value) : undefined;
}
