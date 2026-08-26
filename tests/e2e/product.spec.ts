import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/", "/product", "/truth", "/memory", "/context", "/agents", "/developers",
  "/how-it-works", "/pricing", "/security", "/about", "/login", "/privacy", "/terms",
] as const;

test("every public product route renders without horizontal overflow", async ({ page }) => {
  test.setTimeout(90_000);
  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response?.ok(), `${route} should return a successful response`).toBe(true);
    await expect(page.locator("main")).toBeVisible();
    await expect(page).toHaveTitle(/HARIKOS AI/u);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} should fit the viewport`).toBe(true);
  }
});

test("the public story, product interaction, sign-in boundary, and protected redirect work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /BUILD FAST WITH AI/i })).toBeVisible();
  await page.getByRole("link", { name: /See the Project Brain/i }).click();
  await page.waitForURL("**/product");
  await expect(page.getByRole("heading", { name: /One system for what changed/i })).toBeVisible();

  await page.goto("/developers");
  await page.getByRole("button", { name: "memory billing" }).click();
  await expect(page.getByText(/Keep subscription creation server-side/i).first()).toBeVisible();

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Connect your project brain/i })).toBeVisible();
  const authAvailable = await page.getByRole("link", { name: /Continue with (GitHub|Google)/i }).count();
  if (authAvailable === 0) await expect(page.getByRole("status")).toContainText("AUTHENTICATION UNAVAILABLE");

  await page.goto("/app/dashboard");
  await page.waitForURL("**/login");
  await expect(page.getByRole("heading", { name: /Connect your project brain/i })).toBeVisible();
});

test("unknown routes use the designed 404 state", async ({ page }) => {
  const response = await page.goto("/route-that-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /could not resolve this route/i })).toBeVisible();
});
