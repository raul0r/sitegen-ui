import type { components } from "./schema";

export type Project = components["schemas"]["ProjectSchema"];
export type ProjectCreate = components["schemas"]["ProjectCreate"];
export type ProjectPatch = components["schemas"]["ProjectPatch"];
export type ProjectSummary = components["schemas"]["ProjectSummarySchema"];
export type Artifact = components["schemas"]["ArtifactSchema"];
export type ArtifactContent = components["schemas"]["ArtifactContentSchema"];
export type ArtifactWrite = components["schemas"]["ArtifactWrite"];
export type Job = components["schemas"]["JobSchema"];
export type JobError = components["schemas"]["JobErrorSchema"];
export type Build = components["schemas"]["BuildSchema"];
export type BuildQueued = components["schemas"]["BuildQueuedSchema"];
export type QAReport = components["schemas"]["QAReportSchema"];
export type QARequest = components["schemas"]["QARequest"];
export type Deployment = components["schemas"]["DeploymentSchema"];
export type PreviewRequest = components["schemas"]["PreviewRequest"];
export type PublishRequest = components["schemas"]["PublishRequest"];
export type BranchRequest = components["schemas"]["BranchRequest"];
export type CheckpointRequest = components["schemas"]["CheckpointRequest"];
export type RemoteRequest = components["schemas"]["RemoteRequest"];

export type CapabilityState = {
  implemented: boolean;
  available: boolean;
  validated: boolean;
  configured?: boolean;
  status: string;
  reason: string | null;
};

export type CapabilitiesResponse = {
  capabilities: Record<string, CapabilityState>;
};

export type RepositorySummary = {
  initialized?: boolean;
  branch?: string | null;
  head_sha?: string | null;
  remote_provider?: string | null;
  remote_repository_id?: string | null;
  remote_url?: string | null;
  web_url?: string | null;
};

export type BuildSummary = {
  id?: string;
  status?: string;
  branch?: string | null;
  commit_sha?: string | null;
  output_directory?: string | null;
};

export type QaSummary = {
  id?: string;
  status?: string;
  commit_sha?: string | null;
  preview_ready?: boolean;
};

export type DeploymentSummary = {
  id?: string;
  provider?: string | null;
  status?: string;
  environment?: string | null;
  provider_project_id?: string | null;
  provider_project_name?: string | null;
  provider_deployment_id?: string | null;
  branch?: string | null;
  commit_sha?: string | null;
  url?: string | null;
};

export type LatestJobSummary = {
  id?: string;
  operation?: string;
  status?: string;
  error_code?: string | null;
};

export type SourceControl = {
  provider?: string | null;
  repository_id?: string | null;
  remote_url?: string | null;
  web_url?: string | null;
};

export type QaFinding = {
  severity?: string;
  code?: string;
  title?: string;
  message?: string;
  route?: string;
  browser?: string;
  viewport?: string;
  evidence?: string;
};

export type QaEvidence = {
  type?: string;
  path?: string;
  route?: string;
  browser?: string;
  viewport?: string;
};

export type JobQueued = {
  job: Job;
  build_id?: string;
  deployment?: Deployment;
  qa_report_id?: string;
};

export const JOB_TERMINAL = new Set(["succeeded", "failed", "canceled"]);
export const JOB_ACTIVE = new Set(["pending", "queued", "running"]);

export function isTerminalJobStatus(status: string | undefined): boolean {
  return Boolean(status && JOB_TERMINAL.has(status));
}
