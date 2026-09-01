import { http, HttpResponse } from "msw";

import {
  capabilitiesFixture,
  createdProjectFixture,
  jobFixture,
  projectsFixture,
  summaryFixture,
} from "../fixtures/sitegen";

const store = {
  projects: [...projectsFixture],
  job: jobFixture(),
};

export const handlers = [
  http.get("/api/v1/capabilities", () => HttpResponse.json(capabilitiesFixture)),
  http.get("/api/v1/projects", () => HttpResponse.json(store.projects)),
  http.post("/api/v1/projects", async ({ request }) => {
    const body = (await request.json()) as { name: string; slug?: string | null };
    const created = {
      ...createdProjectFixture,
      name: body.name,
      slug: body.slug || createdProjectFixture.slug,
    };
    store.projects = [created, ...store.projects];
    return HttpResponse.json(created, { status: 201 });
  }),
  http.get("/api/v1/projects/:projectId/summary", () => HttpResponse.json(summaryFixture)),
  http.get("/api/v1/projects/:projectId", ({ params }) => {
    const project = store.projects.find((item) => item.id === params.projectId);
    if (!project) {
      return HttpResponse.json(
        { error: { code: "not_found", message: "Project not found.", retryable: false } },
        { status: 404 },
      );
    }
    return HttpResponse.json(project);
  }),
  http.get("/api/v1/jobs/:jobId", () => HttpResponse.json(store.job)),
  http.get("/api/v1/projects/:projectId/artifacts", () => HttpResponse.json([])),
  http.get("/api/v1/projects/:projectId/builds", () => HttpResponse.json([])),
  http.get("/api/v1/projects/:projectId/qa-reports", () => HttpResponse.json([])),
  http.get("/api/v1/projects/:projectId/deployments", () => HttpResponse.json([])),
  http.get("/api/v1/projects/:projectId/source-control", () =>
    HttpResponse.json({
      provider: null,
      repository_id: null,
      remote_url: null,
      web_url: null,
    }),
  ),
];

export function setJobStatus(status: string) {
  store.job = jobFixture({ status });
}

export function resetStore() {
  store.projects = [...projectsFixture];
  store.job = jobFixture();
}
