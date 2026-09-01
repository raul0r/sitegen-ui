import { expect, test } from "@playwright/test";

test.describe("vertical slice", () => {
  test("loads capabilities and projects through the same-origin proxy", async ({ page }) => {
    const apiCalls: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/api/")) {
        apiCalls.push(url);
        expect(request.headers().authorization ?? "").toBe("");
      }
    });

    await page.goto("/system");
    await expect(page.getByRole("heading", { name: "System / Capabilities" })).toBeVisible();
    await expect(page.getByText("SiteGen API")).toBeVisible();
    await expect(page.getByText("PostgreSQL")).toBeVisible();

    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create Project" })).toBeVisible();
    await expect(page.locator("table")).toBeVisible();

    expect(apiCalls.some((url) => url.includes("/api/v1/capabilities"))).toBe(true);
    expect(apiCalls.some((url) => url.includes("/api/v1/projects"))).toBe(true);
  });

  test("creates a project that survives reload", async ({ page }) => {
    const name = `UI Slice ${Date.now()}`;
    await page.goto("/projects/new");
    await page.getByLabel("Name").fill(name);
    await page.getByRole("button", { name: "Create Project" }).click();
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await page.goto("/projects");
    await expect(page.getByRole("link", { name })).toBeVisible();
    await page.getByRole("link", { name }).click();
    await expect(page.getByRole("heading", { name: "Identity" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Repository" })).toBeVisible();
    await expect(page.getByText("Git is not initialized.")).toBeVisible();
  });

  test("project workspace pages render for an existing SiteGen project", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("link", { name: "Docker Astro Acceptance" }).click();
    await expect(page.getByRole("heading", { name: "Docker Astro Acceptance" })).toBeVisible();
    await expect(page.getByText("Preview ready: YES")).toBeVisible();

    await page.getByRole("link", { name: "Artifacts" }).click();
    await expect(page.getByRole("heading", { name: "Artifacts" })).toBeVisible();
    await expect(page.getByText("package.json")).toBeVisible();

    await page.getByRole("link", { name: "Repository" }).click();
    await expect(page.getByRole("heading", { name: "Repository", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Initialize Git" })).toBeVisible();

    await page.getByRole("link", { name: "Builds" }).click();
    await expect(page.getByRole("heading", { name: "Builds" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Run Build" })).toBeVisible();

    await page.getByRole("link", { name: "QA" }).click();
    await expect(page.getByRole("heading", { name: "QA" })).toBeVisible();
    await expect(page.getByText("Preview ready")).toBeVisible();

    await page.getByRole("link", { name: "Deployments" }).click();
    await expect(page.getByRole("heading", { name: "Deployments" })).toBeVisible();

    await page.getByRole("link", { name: "Audit" }).click();
    await expect(page.getByText("GAP-002")).toBeVisible();
  });
});
