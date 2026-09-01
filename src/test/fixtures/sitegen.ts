import type {
  CapabilitiesResponse,
  Job,
  Project,
  ProjectSummary,
} from "@/lib/api/types";

export const capabilitiesFixture: CapabilitiesResponse = {
  capabilities: {
    local_git: {
      implemented: true,
      available: true,
      validated: true,
      status: "available",
      reason: null,
    },
    database: {
      implemented: true,
      available: true,
      validated: true,
      status: "available",
      reason: null,
    },
    github: {
      implemented: true,
      available: true,
      validated: false,
      configured: true,
      status: "configured",
      reason: null,
    },
    docker: {
      implemented: true,
      available: false,
      validated: false,
      status: "unavailable",
      reason: "docker_socket_not_exposed",
    },
  },
};

export const projectsFixture: Project[] = [
  {
    id: "94fe10f4-3a14-42af-96ff-c53ccb9c8591",
    name: "Docker Acceptance Site",
    slug: "docker-acceptance-site",
    status: "active",
    site_target: "astro",
    default_branch: "main",
    working_branch: "",
    created_at: "2026-08-27T03:58:51.356Z",
    updated_at: "2026-08-27T03:58:51.356Z",
  },
];

export const createdProjectFixture: Project = {
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  name: "Operator UI Slice",
  slug: "operator-ui-slice",
  status: "active",
  site_target: "astro",
  default_branch: "main",
  working_branch: "",
  created_at: "2026-08-31T12:00:00.000Z",
  updated_at: "2026-08-31T12:00:00.000Z",
};

export const summaryFixture: ProjectSummary = {
  project: projectsFixture[0],
  repository: {
    initialized: true,
    branch: "sitegen/docker-acceptance",
    head_sha: "735562b664f344c8fc63bf0f382f637dcada0e6f",
    remote_provider: null,
    remote_repository_id: null,
    remote_url: null,
    web_url: null,
  },
  build: {
    id: "03185a4c-3bc0-41dd-bc76-b52ee0b6c832",
    status: "succeeded",
    branch: "sitegen/docker-acceptance",
    commit_sha: "735562b664f344c8fc63bf0f382f637dcada0e6f",
    output_directory: "dist",
  },
  qa: {
    id: "983a54e0-ce94-444c-ba93-336a8f4db009",
    status: "succeeded",
    commit_sha: "735562b664f344c8fc63bf0f382f637dcada0e6f",
    preview_ready: true,
  },
  deployment: null,
  latest_job: {
    id: "2c39301d-7bee-4cc1-971c-21c2f375ef9e",
    operation: "repository.checkout",
    status: "succeeded",
    error_code: null,
  },
};

export function jobFixture(overrides: Partial<Job> = {}): Job {
  return {
    id: "11111111-2222-3333-4444-555555555555",
    project_id: projectsFixture[0].id,
    operation: "build.run",
    status: "running",
    progress: 40,
    message: "Building",
    result: {},
    error: null,
    retryable: false,
    attempt: 1,
    created_at: "2026-08-31T12:00:00.000Z",
    started_at: "2026-08-31T12:00:01.000Z",
    finished_at: null,
    ...overrides,
  };
}
