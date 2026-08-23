import { expect, test } from "@playwright/test";

test("landing, demo navigation, and current context form a complete product path", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle(/HARIKOS AI/u);
  await expect(
    page.getByRole("heading", {
      name: "Your AI can write the code. HARIKOS makes sure it understands the project.",
    }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  if (testInfo.project.name === "mobile-chrome") {
    await expect(page.getByText("Supabase Auth", { exact: true }).first()).toBeVisible();
    return;
  }

  const connect = page.getByRole("link", { name: "Connect GitHub" }).first();
  await expect(connect).toHaveAttribute("href", "/login");
  await connect.click();
  await page.waitForURL("**/login", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Connect a repository. Build Project Truth." })).toBeVisible();
  await page.getByRole("link", { name: "Open verified local demo" }).click();
  await expect(page.getByRole("heading", { name: /acme-platform is understood/u })).toBeVisible();

  await page.goto("/app/project/demo-project-truth/context");
  await page.getByRole("button", { name: "Prepare Agent Context" }).click();
  const result = page.locator(".context-result");
  await expect(result).toContainText("Supabase Auth (VERIFIED");
  await expect(result).not.toContainText("Clerk (SUPERSEDED");
});
