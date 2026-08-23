import { describe, expect, it, vi } from "vitest";

import { verifyRepositorySelection } from "./cloud-projects";
import type { WebSession } from "./session";

const session: WebSession = {
  user: {
    githubUserId: "42",
    login: "builder",
    name: null,
    avatarUrl: null,
  },
  accessToken: "encrypted-at-rest-by-session-boundary",
  expiresAt: "2026-08-24T00:00:00.000Z",
};

const selection = {
  installationId: "123",
  githubRepositoryId: "456",
  owner: "builder",
  name: "project",
  defaultBranch: "main",
  private: true,
};

describe("cloud repository authorization", () => {
  it("accepts only repository metadata returned by the user's installation", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          repositories: [
            {
              id: 456,
              name: "project",
              private: true,
              default_branch: "main",
              owner: { login: "builder" },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(
      verifyRepositorySelection(session, selection, fetcher),
    ).resolves.toBeUndefined();
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("/user/installations/123/repositories"),
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("rejects forged repository metadata before persistence", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          repositories: [
            {
              id: 456,
              name: "different-project",
              private: true,
              default_branch: "main",
              owner: { login: "builder" },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(
      verifyRepositorySelection(session, selection, fetcher),
    ).rejects.toThrow("metadata did not match");
  });
});
