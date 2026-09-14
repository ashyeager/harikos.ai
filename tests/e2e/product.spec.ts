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
    await expect(page).toHaveTitle(/HARIKOS/u);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} should fit the viewport`).toBe(true);
  }
});

test("the public story, product interaction, sign-in boundary, and protected redirect work", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Many agents.*One verified project state/i })).toBeVisible();
  await page.getByRole("link", { name: /Watch the product walkthrough/i }).click();
  await expect(page.locator("#product-demo video")).toBeVisible();
  await page.goto("/product");
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

test("semantic surfaces keep representative text at WCAG AA contrast in both themes", async ({ page }) => {
  test.setTimeout(90_000);
  const contrast = async (selector: string) => page.locator(selector).first().evaluate((element) => {
    const parse = (value: string) => value.match(/[\d.]+/gu)?.map(Number) ?? [0, 0, 0, 1];
    const luminance = (rgb: number[]) => rgb.map((value) => value / 255).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index]!, 0);
    const style = getComputedStyle(element);
    const foreground = luminance(parse(style.color));
    let painted: Element | null = element;
    let backgroundRgb = [255, 255, 255];
    while (painted) {
      const candidate = parse(getComputedStyle(painted).backgroundColor);
      if ((candidate[3] ?? 1) > 0) { backgroundRgb = candidate.slice(0, 3); break; }
      painted = painted.parentElement;
    }
    const background = luminance(backgroundRgb);
    return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
  });

  for (const theme of ["light", "dark"] as const) {
    await page.addInitScript((value) => localStorage.setItem("harikos-theme", value), theme);
    for (const route of publicRoutes) {
      await page.goto(route);
      const heading = route === "/login" ? ".login-card h2" : "main h1, main h2";
      const body = route === "/login" ? ".login-card > p" : "main p:not(.sr-only)";
      expect(await contrast(heading), `${theme} ${route} heading`).toBeGreaterThanOrEqual(4.5);
      expect(await contrast(body), `${theme} ${route} body text`).toBeGreaterThanOrEqual(4.5);
    }
    await page.goto("/");
    await page.evaluate((value) => {
      localStorage.setItem("harikos-theme", value);
      document.documentElement.dataset.theme = value;
      const probe = document.createElement("article");
      probe.className = "app-frame repository-selector";
      probe.innerHTML = '<p data-contrast-probe>Authorized repositories</p>';
      document.body.appendChild(probe);
    }, theme);
    expect(await contrast("[data-contrast-probe]"), `${theme} authorized repository text`).toBeGreaterThanOrEqual(4.5);
  }
});
