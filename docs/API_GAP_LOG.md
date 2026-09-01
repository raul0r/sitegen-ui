# API Gap Log

Record only gaps confirmed against the actual SiteGen API/OpenAPI.

Inspected: `http://127.0.0.1:8000/api/v1/openapi.json` (OpenAPI 3.1.0, title **SiteGen Next API**, version 1.0.0) on 2026-08-31, plus live `GET /api/v1/capabilities`, `/health/live`, `/health/ready`, and representative project/summary/artifact/QA/deployment responses.

Base path: `/api/v1/`. Bearer token required for all `/api/v1/*` except `GET /api/v1/capabilities`. Health lives outside the API prefix at `/health/live` and `/health/ready`.

## Entry template

### GAP-XXX — Title

**UI requirement:**  
What the operator needs.

**Current SiteGen API:**  
What actually exists.

**Gap:**  
What is missing.

**Impact:**  
What workflow is blocked/degraded.

**Preferred SiteGen resolution:**  
Smallest backend capability that resolves it.

**Temporary UI behavior:**  
How the UI represents the unavailable feature without inventing state.

**Status:** Open / Backend planned / Resolved

---

## Confirmed gaps

### GAP-001 — Gatofeo Level 1 starter initialization

**UI requirement:**  
New Project should offer Empty and a deterministic Gatofeo Level 1 starter that transactionally creates the Level 1 artifact set.

**Current SiteGen API:**  
`POST /api/v1/projects` accepts `{ name, slug?, site_target? }` (`site_target` defaults to `astro`). There is no template, starter, or artifact-seed field, and no `/templates` (or equivalent) endpoint. Artifact writes are per-item via `POST /api/v1/projects/{project_id}/artifacts`.

**Gap:**  
No transactional template initialization capability.

**Impact:**  
Operators can create empty projects and write artifacts individually, but cannot initialize a Gatofeo Level 1 starter as a single SiteGen-owned operation.

**Preferred SiteGen resolution:**  
A project-create template field or `POST /api/v1/projects/{project_id}/templates/gatofeo-level-1` that creates the starter artifacts atomically and returns the project (or a job).

**Temporary UI behavior:**  
Create Empty projects only. Show Gatofeo Level 1 as unavailable with this gap code. Do not assemble a starter from multiple browser-side writes and claim it succeeded.

**Status:** Open

---

### GAP-002 — Audit event listing

**UI requirement:**  
Read-only project (and optionally global) audit timeline: timestamp, actor, request/correlation ID, project, action, result. No secret-bearing payloads.

**Current SiteGen API:**  
Audit events are persisted internally (`apps.audit`) and written by services. OpenAPI and live HTTP have no `GET /api/v1/audit`, `GET /api/v1/projects/{id}/audit`, or equivalent. Job payloads include `id` / `operation` / `status` but not actor or request ID.

**Gap:**  
No operator-readable audit HTTP API.

**Impact:**  
The Audit page cannot show SiteGen's event history.

**Preferred SiteGen resolution:**  
`GET /api/v1/projects/{project_id}/audit-events` (and optionally a global list) returning redacted `{ id, created_at, actor_id, actor_type, action, outcome, request_id, project_id }` with pagination/filters. Do not return secret-bearing metadata.

**Temporary UI behavior:**  
Render an explicit unavailable state citing this gap. Do not invent events from jobs or local storage.

**Status:** Open

---

### GAP-003 — Safe project file tree beyond artifacts

**UI requirement:**  
Browse/read/write SiteGen-authorized project files, not only canonical artifacts.

**Current SiteGen API:**  
Artifact family is implemented: list / write / read / rescan. SiteGen's own API design mentions a files family (`/files`, `/files/content`, move, delete) but those routes 404.

**Gap:**  
No safe files API. Workspace paths are not exposed as a browseable tree.

**Impact:**  
The editor can only show artifacts SiteGen already registered. Source files that exist only on disk and were never written/rescanned as artifacts are invisible. Host paths must not be inferred.

**Preferred SiteGen resolution:**  
Implement the documented files family with workspace-relative paths enforced by `WorkspaceService`, or document artifacts+rescan as the only supported surface.

**Temporary UI behavior:**  
Artifact tree from `GET .../artifacts` only. Offer Rescan when that endpoint exists. Never invent host filesystem listings.

**Status:** Open

---

### GAP-004 — Synchronous repository snapshot endpoint

**UI requirement:**  
Inspect current Git state (initialized, branch, head, remote, dirty) without starting a job.

**Current SiteGen API:**  
`GET /api/v1/projects/{id}/repository` 404s. `GET .../repository/status` queues `repository.status` and returns **202 + Job**. Project summary includes a compact `repository` object (`initialized`, `branch`, `head_sha`, remote fields) with no dirty/staged lists. `RepositoryStatusSchema` exists in backend source but is not a GET response.

**Gap:**  
No synchronous GET of full repository status. Refresh is async-only.

**Impact:**  
Overview can show summary.repository. A dedicated Repository page must either use that snapshot or start a status job and wait.

**Preferred SiteGen resolution:**  
`GET /api/v1/projects/{project_id}/repository` returning `RepositoryStatusSchema` (and remote/provider identity) synchronously.

**Temporary UI behavior:**  
Display `summary.repository` and source-control GET. “Refresh status” triggers the existing status job, polls, then invalidates summary. Do not parse Git output in the browser.

**Status:** Open

---

### GAP-005 — Provider configuration listing

**UI requirement:**  
Show named GitHub/Cloudflare configuration references (never secrets) so publish/deploy forms can choose a configuration.

**Current SiteGen API:**  
`GET /api/v1/provider-configurations` 404s. Capabilities expose github/cloudflare `configured` / `validated` / `status`. Publish uses `{ owner, name, private }`. Preview uses optional `{ provider_project_id, provider_project_name }`. Credentials are environment-backed on the server.

**Gap:**  
No named provider-configuration resource.

**Impact:**  
Publish/deploy forms cannot present a configuration picker. Operators type owner/name (GitHub) or leave Cloudflare identity blank for SiteGen defaults.

**Preferred SiteGen resolution:**  
`GET /api/v1/provider-configurations` returning `{ id, provider, name, configured }` without secrets.

**Temporary UI behavior:**  
Use capability status to explain unconfigured providers. Collect the fields the live publish/preview schemas actually require.

**Status:** Open

---

### GAP-006 — Capabilities and health are outside the Ninja OpenAPI document

**UI requirement:**  
Typed capability discovery for the System page and dependency-aware controls.

**Current SiteGen API:**  
`GET /api/v1/capabilities` works and is public. `/health/live` and `/health/ready` work. Neither appears in `/api/v1/openapi.json` because they are Django views, not Ninja routes. OpenAPI generation itself requires a bearer token (`GET /api/v1/openapi.json` → 401 without it).

**Gap:**  
These routes are real but absent from the generated schema, so types cannot be derived from OpenAPI.

**Impact:**  
UI maintains a small hand-written capabilities/health type. Low risk; live response is stable.

**Preferred SiteGen resolution:**  
Register capabilities (and optionally health) on the Ninja API so they appear in OpenAPI. Consider making schema fetchable without a token, or documenting that schema is authenticated.

**Temporary UI behavior:**  
Call the live endpoints; keep a local type matching the observed payload. Snapshot OpenAPI separately for the Ninja resource families.

**Status:** Open

---

### GAP-007 — Browser-accessible QA evidence

**UI requirement:**  
View screenshots and other QA evidence in the operator UI.

**Current SiteGen API:**  
QA reports include an `evidence` array. Live items look like `{ type: "screenshot", path: "/data/sitegen/projects/.../root.png", route, browser, viewport }`. Those paths are container filesystem locations, not HTTP URLs. No evidence media endpoint exists.

**Gap:**  
Evidence is not fetchable through the SiteGen HTTP API.

**Impact:**  
QA can show counts, readiness, browsers, routes, Lighthouse, and finding text. Screenshots cannot be rendered without bypassing SiteGen (forbidden).

**Preferred SiteGen resolution:**  
Either signed/relative evidence URLs, e.g. `GET /api/v1/projects/{id}/qa-reports/{report_id}/evidence/{evidence_id}`, or store browser-safe URLs instead of host paths.

**Temporary UI behavior:**  
List evidence metadata (type, route, browser, viewport). Do not display raw host paths as links and do not fetch the workspace volume.

**Status:** Open

---

## Confirmed non-gaps (present; UI must follow the real contract)

These were open questions before the audit. They are **not** gaps:

- **Projects:** list, create, get, patch, archive, summary — implemented.
- **Artifacts:** list, write (POST upsert), read (with content), rescan — implemented. Write uses `kind`, `relative_path`, `content`, `content_type`. Canonical kinds exist (`agents`, `tasks`, `start_here`, …) plus `other`.
- **Jobs:** get, retry, cancel. Statuses: `pending`, `queued`, `running`, `succeeded`, `failed`, `canceled`. Poll `GET /api/v1/jobs/{job_id}`.
- **Repository actions:** init, status (async job), branches, checkout, checkpoints, remote, push — all 202 jobs.
- **GitHub publish:** `POST .../source-control/publish` and `GET .../source-control`.
- **Builds:** list, get, queue build, install dependencies.
- **QA:** list/get reports, queue run with `{ build_id, routes?, target_url? }`. `summary.preview_ready` is authoritative. Live QA is the same run with `target_url` set to the preview URL.
- **Deployments:** list, get, preview, refresh. Production exists as `POST .../deployments/production` and **must not** be exposed in UI V1 (product policy, not a missing API).
- **Capabilities:** implemented/available/validated/configured/status/reason for git, node, astro, playwright, lighthouse, worker, postgres, redis, github, cloudflare, docker.

## UI policy (not gaps)

- Do not call `POST /api/v1/projects/{id}/deployments/production`.
- Do not expose force-push, reset, rebase, or arbitrary Git.
- Do not treat host paths in QA evidence as operator-accessible files.
