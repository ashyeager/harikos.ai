import { createRequire } from "node:module";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const requireFromRoot = createRequire(join(process.cwd(), "package.json"));

describe("GitHubRepositorySource", () => {
  it("uses server token access and filters secret paths", async () => {
    const { GitHubRepositorySource } = requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    );
    const calls: string[] = [];
    const fetcher = (async (input: string | URL | Request) => {
      const url = String(input);
      calls.push(url);
      if (url.includes("/git/trees/")) {
        return Response.json({
          truncated: false,
          tree: [
            { path: "package.json", type: "blob", size: 40, sha: "blob1" },
            { path: ".env", type: "blob", size: 20, sha: "secret" },
          ],
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    }) as typeof fetch;
    const source = new GitHubRepositorySource({
      owner: "acme",
      repository: "platform",
      tokenProvider: async () => "installation-token",
      fetcher,
      apiBaseUrl: "https://github.invalid",
    });

    const tree = await source.getTree("main");
    expect(tree.map((entry: { path: string }) => entry.path)).toEqual(["package.json"]);
    expect(calls[0]).toContain("/repos/acme/platform/git/trees/main");
  });

  it("rejects truncated GitHub trees instead of treating partial evidence as complete", async () => {
    const { GitHubRepositorySource } = requireFromRoot(
      join(process.cwd(), "packages", "core", "dist", "index.js"),
    );
    const source = new GitHubRepositorySource({
      owner: "acme",
      repository: "large-platform",
      tokenProvider: async () => "installation-token",
      fetcher: (async () => Response.json({ truncated: true, tree: [] })) as typeof fetch,
      apiBaseUrl: "https://github.invalid",
    });

    await expect(source.getTree("main")).rejects.toThrow("truncated repository tree");
  });
});
