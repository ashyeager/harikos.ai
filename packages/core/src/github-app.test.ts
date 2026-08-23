import { generateKeyPairSync } from "node:crypto";
import { createRequire } from "node:module";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

const requireFromRoot = createRequire(join(process.cwd(), "package.json"));

describe("GitHub App token boundary", () => {
  it("downscopes installation tokens to read-only contents and metadata", async () => {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const config = {
      appId: "41820",
      slug: "harikos-test",
      privateKey: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        token: "installation-token",
        expires_at: "2026-08-23T20:00:00.000Z",
        permissions: { contents: "read", metadata: "read" },
      }),
    );
    const { createGitHubInstallationToken } = requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    );

    await expect(
      createGitHubInstallationToken(config, "123", {
        repositoryId: "456",
        fetcher,
      }),
    ).resolves.toMatchObject({ token: "installation-token" });
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("/app/installations/123/access_tokens"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          repository_ids: [456],
          permissions: { contents: "read", metadata: "read" },
        }),
      }),
    );
  });
});
