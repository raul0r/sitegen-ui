import { expect, test } from "@playwright/test";

test("browser never sends or receives the SiteGen bearer token", async ({ page }) => {
  const leaked: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/")) {
      const authorization = request.headers().authorization ?? "";
      if (authorization) leaked.push(`request ${request.url()} ${authorization}`);
    }
  });
  page.on("response", async (response) => {
    if (!response.url().includes("/api/")) return;
    const authorization = response.headers().authorization ?? "";
    if (authorization) leaked.push(`response header ${response.url()}`);
  });

  await page.goto("/system");
  await expect(page.getByText("SiteGen API")).toBeVisible();
  const html = await page.content();
  expect(html).not.toMatch(/VITE_SITEGEN_API_TOKEN/);
  expect(leaked).toEqual([]);
});
