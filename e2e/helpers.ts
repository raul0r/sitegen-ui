import { expect, type Page } from "@playwright/test";

export const JOB_TIMEOUT_MS = 8 * 60_000;

export async function waitForJobTerminal(page: Page, timeout = JOB_TIMEOUT_MS): Promise<string> {
  const status = page.getByTestId("job-status");
  await expect(status).toBeVisible({ timeout: 30_000 });
  await expect(status).toHaveText(/succeeded|failed|canceled/i, { timeout });
  return ((await status.textContent()) ?? "").trim();
}

export async function expectJobSucceeded(page: Page, timeout = JOB_TIMEOUT_MS) {
  const status = await waitForJobTerminal(page, timeout);
  expect(status, await page.getByTestId("job-panel").innerText()).toBe("succeeded");
}

export async function clickJobAction(page: Page, buttonName: string) {
  const previousId = await page
    .getByTestId("job-id")
    .textContent()
    .catch(() => null);
  await page.getByRole("button", { name: buttonName, exact: true }).click();
  if (previousId) {
    await expect(page.getByTestId("job-id")).not.toHaveText(previousId.trim(), {
      timeout: 20_000,
    });
  } else {
    await expect(page.getByTestId("job-panel")).toBeVisible({ timeout: 20_000 });
  }
}

export async function createArtifactViaUi(
  page: Page,
  params: { path: string; kind?: string; content: string },
) {
  await page.getByRole("button", { name: "New Artifact" }).first().click();
  await page.getByLabel("Relative path").fill(params.path);
  if (params.kind) {
    await page.locator("#artifact-kind").selectOption(params.kind);
  }
  await page.getByLabel("Content").fill(params.content);
  await page.getByRole("button", { name: "Write Artifact" }).click();
  await expect(page.getByRole("button", { name: "Write Artifact" })).toHaveCount(0, {
    timeout: 15_000,
  });
  await expect(page.getByText(params.path, { exact: true }).first()).toBeVisible();
}

export async function writeArtifactViaProxy(
  page: Page,
  projectId: string,
  body: { kind: string; relative_path: string; content: string; content_type?: string },
) {
  const response = await page.request.post(`/api/v1/projects/${projectId}/artifacts`, {
    data: body,
    timeout: 60_000,
  });
  expect(response.ok(), await response.text()).toBeTruthy();
}

export function projectIdFromUrl(page: Page): string {
  const match = page.url().match(/\/projects\/([0-9a-f-]{36})/i);
  if (!match?.[1]) {
    throw new Error(`Could not parse project id from ${page.url()}`);
  }
  return match[1];
}
