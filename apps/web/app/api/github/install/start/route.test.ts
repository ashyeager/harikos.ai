import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthIdentity: vi.fn(),
  readGitHubAppConfig: vi.fn(),
  createInstallationState: vi.fn(),
}));

vi.mock("@harikos/core", () => ({
  readGitHubAppConfig: mocks.readGitHubAppConfig,
}));
vi.mock("../../../../../lib/auth", () => ({
  getAuthIdentity: mocks.getAuthIdentity,
}));
vi.mock("../../../../../lib/github-installation", () => ({
  createInstallationState: mocks.createInstallationState,
}));

import { GET } from "./route";

describe("GitHub App installation start", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthIdentity.mockResolvedValue({ id: "user-1" });
    mocks.readGitHubAppConfig.mockReturnValue({
      appId: "4693646",
      privateKey: "unused-in-route-test",
      slug: "harikos-ai-project-truth",
    });
    mocks.createInstallationState.mockReturnValue("signed-state");
  });

  it("starts at the GitHub App installation page with signed state", async () => {
    const response = await GET();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://github.com/apps/harikos-ai-project-truth/installations/new?state=signed-state",
    );
    expect(mocks.createInstallationState).toHaveBeenCalledWith("user-1");
  });
});
