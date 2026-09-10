import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthIdentity: vi.fn(),
  saveCloudInstallation: vi.fn(),
  readGitHubAppOAuthConfig: vi.fn(),
  completeGitHubInstallation: vi.fn(),
  createInstallationState: vi.fn(),
  verifyInstallationState: vi.fn(),
}));

vi.mock("@harikos/core", () => ({ readGitHubAppConfig: vi.fn() }));
vi.mock("../../../../../lib/auth", () => ({
  getAuthIdentity: mocks.getAuthIdentity,
}));
vi.mock("../../../../../lib/cloud-projects", () => ({
  saveCloudInstallation: mocks.saveCloudInstallation,
}));
vi.mock("../../../../../lib/config", () => ({
  applicationOrigin: (url: string) => new URL(url).origin,
  readGitHubAppOAuthConfig: mocks.readGitHubAppOAuthConfig,
}));
vi.mock("../../../../../lib/github-installation", () => ({
  completeGitHubInstallation: mocks.completeGitHubInstallation,
  createInstallationState: mocks.createInstallationState,
  GitHubInstallationRequiredError: class extends Error {},
  verifyInstallationState: mocks.verifyInstallationState,
}));

import { GET } from "./route";

describe("GitHub App installation callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthIdentity.mockResolvedValue({ id: "user-1" });
    mocks.readGitHubAppOAuthConfig.mockReturnValue({
      clientId: "Iv23li2sCFygLs30N9Mr",
      clientSecret: "not-returned-to-browser",
    });
    mocks.createInstallationState.mockReturnValue("candidate-bound-state");
  });

  it("binds the candidate installation to new state before user OAuth", async () => {
    const response = await GET(
      new Request(
        "https://harikos-ai.vercel.app/api/github/install/callback?installation_id=155990583&state=initial-state",
      ),
    );

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.origin + location.pathname).toBe(
      "https://github.com/login/oauth/authorize",
    );
    expect(location.searchParams.get("client_id")).toBe("Iv23li2sCFygLs30N9Mr");
    expect(location.searchParams.get("state")).toBe("candidate-bound-state");
    expect(mocks.verifyInstallationState).toHaveBeenCalledWith(
      "initial-state",
      "user-1",
    );
    expect(mocks.createInstallationState).toHaveBeenCalledWith(
      "user-1",
      process.env,
      expect.any(Number),
      "155990583",
    );
    expect(mocks.completeGitHubInstallation).not.toHaveBeenCalled();
    expect(mocks.saveCloudInstallation).not.toHaveBeenCalled();
  });
});
