import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthIdentity: vi.fn(),
  readGitHubAppConfig: vi.fn(),
  readGitHubAppOAuthConfig: vi.fn(),
  createInstallationState: vi.fn(),
}));

vi.mock("@harikos/core", () => ({
  readGitHubAppConfig: mocks.readGitHubAppConfig,
}));
vi.mock("../../../../../lib/auth", () => ({
  getAuthIdentity: mocks.getAuthIdentity,
}));
vi.mock("../../../../../lib/config", () => ({
  applicationOrigin: () => "https://harikos-ai.vercel.app",
  readGitHubAppOAuthConfig: mocks.readGitHubAppOAuthConfig,
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
    mocks.readGitHubAppOAuthConfig.mockReturnValue({
      clientId: "Iv23test",
      clientSecret: "unused-in-route-test",
    });
    mocks.createInstallationState.mockReturnValue("signed-state");
  });

  it("authorizes the user so existing installations can be discovered", async () => {
    const response = await GET(new Request("https://harikos-ai.vercel.app/api/github/install/start"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://github.com/login/oauth/authorize?client_id=Iv23test&redirect_uri=https%3A%2F%2Fharikos-ai.vercel.app%2Fapi%2Fgithub%2Finstall%2Fcallback&state=signed-state",
    );
    expect(mocks.createInstallationState).toHaveBeenCalledWith("user-1");
  });
});
