import { expect, test } from "@playwright/test";

import {
  clickJobAction,
  createArtifactViaUi,
  expectJobSucceeded,
  projectIdFromUrl,
  waitForJobTerminal,
  writeArtifactViaProxy,
} from "./helpers";

const GITHUB_OWNER = process.env.E2E_GITHUB_OWNER ?? "gatofeo-agency";
const LOCKFILE_SOURCE_PROJECT = "62c8ef81-8e43-4594-be72-71fe57bce20c";

const PACKAGE_JSON = JSON.stringify(
  {
    name: "sitegen-ui-operator-accept",
    type: "module",
    scripts: { build: "astro build" },
    dependencies: { astro: "^5.14.1" },
  },
  null,
  2,
);

const INDEX_ASTRO = `---
const title = 'SiteGen UI operator acceptance';
---
<html><body><h1>{title}</h1></body></html>
`;

const GITIGNORE = `node_modules/
dist/
.astro/
.sitegen/
`;

test.describe.configure({ mode: "serial" });

test.describe("live operator workflow", () => {
  test.setTimeout(30 * 60_000);

  test("artifacts → git → build → QA → GitHub → preview → live QA", async ({ page }) => {
    const stamp = Date.now().toString(36);
    const projectName = `UI Workflow ${stamp}`;
    const branch = `sitegen/ui-${stamp}`;
    const repoName = `sitegen-ui-${stamp}`;
    const marker = `operator-edit-${stamp}`;

    const apiCalls: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/")) {
        expect(request.headers().authorization ?? "", request.url()).toBe("");
        apiCalls.push(`${request.method()} ${new URL(request.url()).pathname}`);
      }
    });

    await page.goto("/projects/new");
    await page.getByLabel("Name").fill(projectName);
    await page.getByRole("button", { name: "Create Project" }).click();
    await expect(page.getByRole("heading", { name: projectName })).toBeVisible();
    const projectId = projectIdFromUrl(page);

    await page.getByRole("link", { name: "Artifacts" }).click();
    await createArtifactViaUi(page, {
      path: "DESIGN_SYSTEM.md",
      kind: "design_system",
      content: "# Design\n",
    });
    await expect(page.getByTestId("artifact-path")).toHaveText("DESIGN_SYSTEM.md", {
      timeout: 15_000,
    });
    await page.locator(".cm-content").click();
    await page.keyboard.type(`\n${marker}\n`);
    await expect(page.getByTestId("dirty-indicator")).toBeVisible();
    await page.getByRole("button", { name: "Save Artifact" }).click();
    await expect(page.getByTestId("saved-indicator")).toBeVisible({ timeout: 15_000 });
    await page.reload();
    await expect(page.getByTestId("artifact-path")).toHaveText("DESIGN_SYSTEM.md");
    await expect(page.locator(".cm-content")).toContainText(marker);

    await page.getByRole("button", { name: "New Artifact" }).first().click();
    await page.getByLabel("Relative path").fill("../escape.md");
    await page.getByLabel("Content").fill("should fail");
    await page.getByRole("button", { name: "Write Artifact" }).click();
    await expect(page.getByText(/traversal|outside|invalid path/i).first()).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("heading", { name: "New Artifact" })).toHaveCount(0);

    await writeArtifactViaProxy(page, projectId, {
      kind: "other",
      relative_path: "package.json",
      content: PACKAGE_JSON,
      content_type: "application/json",
    });
    await writeArtifactViaProxy(page, projectId, {
      kind: "other",
      relative_path: "src/pages/index.astro",
      content: INDEX_ASTRO,
      content_type: "text/plain",
    });
    await writeArtifactViaProxy(page, projectId, {
      kind: "other",
      relative_path: ".gitignore",
      content: GITIGNORE,
      content_type: "text/plain",
    });
    const lockSource = await page.request.get(
      `/api/v1/projects/${LOCKFILE_SOURCE_PROJECT}/artifacts`,
      { timeout: 30_000 },
    );
    expect(lockSource.ok()).toBeTruthy();
    const artifacts = (await lockSource.json()) as { id: string; relative_path: string }[];
    const lockMeta = artifacts.find((item) => item.relative_path === "package-lock.json");
    expect(lockMeta, "seed lockfile artifact").toBeTruthy();
    const lockBody = await page.request.get(
      `/api/v1/projects/${LOCKFILE_SOURCE_PROJECT}/artifacts/${lockMeta!.id}`,
      { timeout: 30_000 },
    );
    const lockContent = ((await lockBody.json()) as { content: string }).content;
    await writeArtifactViaProxy(page, projectId, {
      kind: "other",
      relative_path: "package-lock.json",
      content: lockContent,
      content_type: "application/json",
    });
    await page.getByRole("button", { name: "Refresh" }).click();
    await expect(page.getByText("package.json")).toBeVisible();

    await page.getByRole("link", { name: "Repository" }).click();
    await clickJobAction(page, "Initialize Git");
    await expectJobSucceeded(page);
    await expect(page.getByTestId("repo-initialized")).toContainText("yes");
    await page.reload();
    await expect(page.getByTestId("repo-initialized")).toContainText("yes");

    await page.getByLabel("Branch").fill(branch);
    await clickJobAction(page, "Create Branch");
    await expectJobSucceeded(page);
    await page.getByLabel("Message").fill(`checkpoint ${stamp}`);
    await clickJobAction(page, "Create Checkpoint");
    await expectJobSucceeded(page);
    await clickJobAction(page, "Refresh repository status");
    await expectJobSucceeded(page);
    await expect(page.getByTestId("repo-branch")).toContainText(branch);
    await expect(page.getByTestId("repo-head")).not.toContainText("HEAD —");
    const headBefore = (await page.getByTestId("repo-head").textContent()) ?? "";
    await page.reload();
    await expect(page.getByTestId("repo-branch")).toContainText(branch);
    await expect(page.getByTestId("repo-head")).toHaveText(headBefore.trim());

    await page.getByRole("link", { name: "Builds" }).click();
    await clickJobAction(page, "Run Build");
    const firstBuild = await waitForJobTerminal(page, 10 * 60_000);
    if (firstBuild === "succeeded") {
      test.info().annotations.push({
        type: "note",
        description: "First build succeeded without a separate install job.",
      });
    } else {
      expect(firstBuild).toBe("failed");
      await expect(page.getByTestId("job-error")).toBeVisible();
      await clickJobAction(page, "Install Dependencies");
      await expectJobSucceeded(page, 10 * 60_000);
      await clickJobAction(page, "Run Build");
      await expectJobSucceeded(page, 10 * 60_000);
    }
    await expect(page.getByText(/succeeded/i).first()).toBeVisible();
    await page.reload();
    await expect(page.locator("table")).toContainText("Succeeded");

    await page.getByRole("link", { name: "QA" }).click();
    await clickJobAction(page, "Run QA");
    await expectJobSucceeded(page, 10 * 60_000);
    await expect(page.getByTestId("preview-ready")).toHaveText("YES");
    await expect(page.getByText("chromium executed")).toBeVisible();
    await expect(page.getByText("firefox executed")).toBeVisible();
    await expect(page.getByText("webkit executed")).toBeVisible();
    await expect(page.getByText(/Performance/)).toBeVisible();
    await expect(page.getByText("GAP-007")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("preview-ready")).toHaveText("YES");

    await page.getByRole("link", { name: "Repository" }).click();
    await page.getByLabel("Owner").fill(GITHUB_OWNER);
    await page.getByLabel("Repository name").fill(repoName);
    await clickJobAction(page, "Publish GitHub");
    await expectJobSucceeded(page, 3 * 60_000);
    await expect(page.getByTestId("repo-remote")).toContainText(GITHUB_OWNER);
    await page.getByLabel("Branch").fill(branch);
    await clickJobAction(page, "Push Branch");
    await expectJobSucceeded(page, 3 * 60_000);
    await page.reload();
    await expect(page.getByTestId("repo-remote")).toContainText("github.com");

    await page.getByRole("link", { name: "Deployments" }).click();
    await clickJobAction(page, "Deploy Preview");
    await expectJobSucceeded(page, 10 * 60_000);
    await expect(page.getByRole("link", { name: "Open Preview" })).toBeVisible();
    const previewHref = await page.getByRole("link", { name: "Open Preview" }).getAttribute("href");
    expect(previewHref).toMatch(/^https:\/\//);
    await clickJobAction(page, "Refresh Deployment");
    await expectJobSucceeded(page, 2 * 60_000);
    await expect
      .poll(
        async () => {
          try {
            const response = await page.request.get(previewHref ?? "", { timeout: 15_000 });
            return response.status();
          } catch {
            return 0;
          }
        },
        { timeout: 3 * 60_000, intervals: [2000, 5000, 5000] },
      )
      .toBe(200);
    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Open Preview" }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
    await popup.close();

    await clickJobAction(page, "Run Live QA");
    await expectJobSucceeded(page, 10 * 60_000);
    await page.getByRole("link", { name: "QA" }).click();
    await expect(page.getByTestId("preview-ready")).toHaveText("YES");
    await page.reload();
    await expect(page.getByRole("heading", { name: "QA" })).toBeVisible();
    await expect(page.getByTestId("preview-ready")).toHaveText("YES");

    const pageContent = await page.content();
    expect(pageContent).not.toMatch(/VITE_SITEGEN_API_TOKEN/);
    expect(apiCalls.some((item) => item.includes("/api/v1/projects"))).toBe(true);
  });
});
