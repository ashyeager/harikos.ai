import {
  createGitHubAppJwt,
  listGitHubInstallationRepositories,
  readGitHubAppConfig,
} from "@harikos/core";

const config = readGitHubAppConfig();
if (!config) {
  throw new Error("GitHub App configuration is missing.");
}

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${createGitHubAppJwt(config)}`,
  "X-GitHub-Api-Version": "2022-11-28",
};

const appResponse = await fetch("https://api.github.com/app", { headers });
if (!appResponse.ok) {
  throw new Error(`GitHub App lookup failed with status ${appResponse.status}.`);
}
const app = (await appResponse.json()) as {
  slug?: string;
  client_id?: string;
  permissions?: Record<string, string>;
};

const installationsResponse = await fetch(
  "https://api.github.com/app/installations?per_page=100",
  { headers },
);
if (!installationsResponse.ok) {
  throw new Error(
    `GitHub installation lookup failed with status ${installationsResponse.status}.`,
  );
}
const installations = (await installationsResponse.json()) as Array<{
  id: number;
  account?: { login?: string };
  repository_selection?: string;
}>;

const summaries = [];
for (const installation of installations) {
  const repositories = await listGitHubInstallationRepositories(
    config,
    String(installation.id),
  );
  summaries.push({
    account: installation.account?.login ?? "unknown",
    selection: installation.repository_selection ?? "unknown",
    repositories: repositories.map(
      (repository) => `${repository.owner.login}/${repository.name}`,
    ),
    repositoryCount: repositories.length,
  });
}

process.stdout.write(
  `${JSON.stringify(
    {
      appAuthenticated: true,
      slugMatches: app.slug === config.slug,
      clientIdMatches: app.client_id === process.env.GITHUB_CLIENT_ID,
      permissions: app.permissions ?? {},
      installationCount: installations.length,
      installations: summaries,
    },
    null,
    2,
  )}\n`,
);
