import { describe, expect, it } from "vitest";

import { verifyRepositorySelection } from "./cloud-projects";

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
    expect(() =>
      verifyRepositorySelection(
        [
          {
            id: 456,
            name: "project",
            private: true,
            default_branch: "main",
            owner: { login: "builder" },
          },
        ],
        selection,
      ),
    ).not.toThrow();
  });

  it("rejects forged repository metadata before persistence", async () => {
    expect(() =>
      verifyRepositorySelection(
        [
          {
            id: 456,
            name: "different-project",
            private: true,
            default_branch: "main",
            owner: { login: "builder" },
          },
        ],
        selection,
      ),
    ).toThrow("metadata did not match");
  });
});
