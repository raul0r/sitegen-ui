import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { server } from "@/test/msw/server";

import { ArtifactsPage } from "./artifacts-page";

const projectId = "94fe10f4-3a14-42af-96ff-c53ccb9c8591";
const artifact = {
  id: "3c0ed640-8282-468c-9dc7-7b749c573a66",
  kind: "design_system",
  relative_path: "DESIGN_SYSTEM.md",
  content_type: "text/markdown",
  checksum: "abc",
  version: 1,
  source: "api",
  created_at: "2026-08-31T12:00:00.000Z",
  updated_at: "2026-08-31T12:00:00.000Z",
  content: "# Design\n",
};

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [{ path: "/projects/:projectId/artifacts", element: <ArtifactsPage /> }],
    { initialEntries: [`/projects/${projectId}/artifacts`] },
  );
  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("ArtifactsPage", () => {
  it("creates, edits, and saves an artifact through the API", async () => {
    const user = userEvent.setup();
    let saved: string | undefined;
    server.use(
      http.get(`/api/v1/projects/${projectId}/artifacts`, () =>
        HttpResponse.json(saved ? [{ ...artifact, version: 2 }] : []),
      ),
      http.get(`/api/v1/projects/${projectId}/artifacts/${artifact.id}`, () =>
        HttpResponse.json({ ...artifact, content: saved ?? artifact.content, version: saved ? 2 : 1 }),
      ),
      http.post(`/api/v1/projects/${projectId}/artifacts`, async ({ request }) => {
        const body = (await request.json()) as { relative_path: string; content: string };
        if (body.relative_path.includes("..")) {
          return HttpResponse.json(
            {
              error: {
                code: "workspace_path_invalid",
                message: "The requested path is outside the project workspace.",
                retryable: false,
              },
            },
            { status: 400 },
          );
        }
        saved = body.content;
        return HttpResponse.json({ ...artifact, content: body.content, version: 2 }, { status: 201 });
      }),
    );

    renderPage();
    await user.click(await screen.findByRole("button", { name: "New Artifact" }));
    await user.type(screen.getByLabelText("Relative path"), "DESIGN_SYSTEM.md");
    await user.type(screen.getByLabelText("Content"), "# Design\n");
    await user.click(screen.getByRole("button", { name: "Write Artifact" }));
    await screen.findByTestId("artifact-path");

    await user.click(await screen.findByRole("button", { name: "New Artifact" }));
    await user.type(screen.getByLabelText("Relative path"), "../escape.md");
    await user.type(screen.getByLabelText("Content"), "nope");
    await user.click(screen.getByRole("button", { name: "Write Artifact" }));
    await waitFor(() => {
      expect(screen.getByText(/outside the project workspace/i)).toBeInTheDocument();
    });
  });
});
