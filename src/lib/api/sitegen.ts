import { apiRequest } from "./client";
import type {
  Artifact,
  ArtifactContent,
  ArtifactWrite,
  BranchRequest,
  Build,
  BuildQueued,
  CapabilitiesResponse,
  CheckpointRequest,
  Deployment,
  Job,
  PreviewRequest,
  Project,
  ProjectCreate,
  ProjectPatch,
  ProjectSummary,
  PublishRequest,
  QAReport,
  QARequest,
  RemoteRequest,
  SourceControl,
} from "./types";

const api = "/api/v1";

export const sitegen = {
  capabilities: () => apiRequest<CapabilitiesResponse>(`${api}/capabilities`),

  listProjects: () => apiRequest<Project[]>(`${api}/projects`),
  createProject: (body: ProjectCreate) =>
    apiRequest<Project>(`${api}/projects`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getProject: (projectId: string) => apiRequest<Project>(`${api}/projects/${projectId}`),
  updateProject: (projectId: string, body: ProjectPatch) =>
    apiRequest<Project>(`${api}/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  getSummary: (projectId: string) =>
    apiRequest<ProjectSummary>(`${api}/projects/${projectId}/summary`),

  listArtifacts: (projectId: string) =>
    apiRequest<Artifact[]>(`${api}/projects/${projectId}/artifacts`),
  writeArtifact: (projectId: string, body: ArtifactWrite) =>
    apiRequest<Artifact>(`${api}/projects/${projectId}/artifacts`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  readArtifact: (projectId: string, artifactId: string) =>
    apiRequest<ArtifactContent>(`${api}/projects/${projectId}/artifacts/${artifactId}`),
  rescanArtifacts: (projectId: string) =>
    apiRequest<Artifact[]>(`${api}/projects/${projectId}/artifacts/rescan`, {
      method: "POST",
    }),

  getJob: (jobId: string) => apiRequest<Job>(`${api}/jobs/${jobId}`),
  retryJob: (jobId: string) =>
    apiRequest<Job>(`${api}/jobs/${jobId}/retry`, { method: "POST" }),
  cancelJob: (jobId: string) =>
    apiRequest<Job>(`${api}/jobs/${jobId}/cancel`, { method: "POST" }),

  initRepository: (projectId: string) =>
    apiRequest<Job>(`${api}/projects/${projectId}/repository/init`, { method: "POST" }),
  refreshRepositoryStatus: (projectId: string) =>
    apiRequest<Job>(`${api}/projects/${projectId}/repository/status`),
  createBranch: (projectId: string, body: BranchRequest) =>
    apiRequest<Job>(`${api}/projects/${projectId}/repository/branches`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  checkoutBranch: (projectId: string, body: BranchRequest) =>
    apiRequest<Job>(`${api}/projects/${projectId}/repository/checkout`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  checkpoint: (projectId: string, body: CheckpointRequest) =>
    apiRequest<Job>(`${api}/projects/${projectId}/repository/checkpoints`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  configureRemote: (projectId: string, body: RemoteRequest) =>
    apiRequest<Job>(`${api}/projects/${projectId}/repository/remote`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  pushBranch: (projectId: string, body: BranchRequest) =>
    apiRequest<Job>(`${api}/projects/${projectId}/repository/push`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getSourceControl: (projectId: string) =>
    apiRequest<SourceControl>(`${api}/projects/${projectId}/source-control`),
  publishGitHub: (projectId: string, body: PublishRequest) =>
    apiRequest<Job>(`${api}/projects/${projectId}/source-control/publish`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  listBuilds: (projectId: string) =>
    apiRequest<Build[]>(`${api}/projects/${projectId}/builds`),
  getBuild: (projectId: string, buildId: string) =>
    apiRequest<Build>(`${api}/projects/${projectId}/builds/${buildId}`),
  runBuild: (projectId: string) =>
    apiRequest<BuildQueued>(`${api}/projects/${projectId}/builds`, { method: "POST" }),
  installDependencies: (projectId: string) =>
    apiRequest<Job>(`${api}/projects/${projectId}/dependencies/install`, { method: "POST" }),

  listQaReports: (projectId: string) =>
    apiRequest<QAReport[]>(`${api}/projects/${projectId}/qa-reports`),
  getQaReport: (projectId: string, reportId: string) =>
    apiRequest<QAReport>(`${api}/projects/${projectId}/qa-reports/${reportId}`),
  runQa: (projectId: string, body: QARequest) =>
    apiRequest<{ job: Job; qa_report_id?: string }>(`${api}/projects/${projectId}/qa-runs`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  listDeployments: (projectId: string) =>
    apiRequest<Deployment[]>(`${api}/projects/${projectId}/deployments`),
  getDeployment: (projectId: string, deploymentId: string) =>
    apiRequest<Deployment>(`${api}/projects/${projectId}/deployments/${deploymentId}`),
  deployPreview: (projectId: string, body: PreviewRequest = {}) =>
    apiRequest<{ deployment: Deployment; job: Job }>(
      `${api}/projects/${projectId}/deployments/preview`,
      { method: "POST", body: JSON.stringify(body) },
    ),
  refreshDeployment: (projectId: string, deploymentId: string) =>
    apiRequest<{ deployment: Deployment; job: Job }>(
      `${api}/projects/${projectId}/deployments/${deploymentId}/refresh`,
      { method: "POST" },
    ),
};
