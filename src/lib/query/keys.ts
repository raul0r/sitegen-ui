export const queryKeys = {
  capabilities: ["capabilities"] as const,
  projects: ["projects"] as const,
  project: (projectId: string) => ["project", projectId] as const,
  projectSummary: (projectId: string) => ["project", projectId, "summary"] as const,
  artifacts: (projectId: string) => ["artifacts", projectId] as const,
  artifact: (projectId: string, artifactId: string) =>
    ["artifact", projectId, artifactId] as const,
  sourceControl: (projectId: string) => ["source-control", projectId] as const,
  job: (jobId: string) => ["job", jobId] as const,
  builds: (projectId: string) => ["builds", projectId] as const,
  build: (projectId: string, buildId: string) => ["build", projectId, buildId] as const,
  qaReports: (projectId: string) => ["qaReports", projectId] as const,
  qaReport: (projectId: string, reportId: string) => ["qaReport", projectId, reportId] as const,
  deployments: (projectId: string) => ["deployments", projectId] as const,
  deployment: (projectId: string, deploymentId: string) =>
    ["deployment", projectId, deploymentId] as const,
};
