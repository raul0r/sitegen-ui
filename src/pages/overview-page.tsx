import { Link, useParams } from "react-router";

import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/feedback/page-header";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectSummary } from "@/features/projects/use-projects";
import type {
  BuildSummary,
  DeploymentSummary,
  LatestJobSummary,
  QaSummary,
  RepositorySummary,
} from "@/lib/api/types";
import { formatDateTime, shortSha } from "@/lib/format/status";

export function OverviewPage() {
  const { projectId = "" } = useParams();
  const summary = useProjectSummary(projectId);
  const project = summary.data?.project;
  const repository = summary.data?.repository as RepositorySummary | null | undefined;
  const build = summary.data?.build as BuildSummary | null | undefined;
  const qa = summary.data?.qa as QaSummary | null | undefined;
  const deployment = summary.data?.deployment as DeploymentSummary | null | undefined;
  const latestJob = summary.data?.latest_job as LatestJobSummary | null | undefined;

  return (
    <div>
      <PageHeader
        title={project?.name ?? "Project"}
        description={project ? `${project.slug} · ${project.site_target}` : "Loading project summary"}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void summary.refetch()}>
              Refresh
            </Button>
            {deployment?.url ? (
              <Button asChild size="sm">
                <a href={deployment.url} target="_blank" rel="noreferrer">
                  Open Preview
                </a>
              </Button>
            ) : null}
          </>
        }
      />
      {summary.isLoading ? <LoadingSkeleton /> : null}
      {summary.error ? (
        <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />
      ) : null}
      {project ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                Status <StatusBadge value={project.status} />
              </p>
              <p className="font-mono text-xs">{project.id}</p>
              <p className="text-muted-foreground">Updated {formatDateTime(project.updated_at)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Repository</CardTitle>
              <Button asChild size="sm" variant="ghost">
                <Link to={`/projects/${projectId}/repository`}>Open</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {repository?.initialized ? (
                <>
                  <p>Git initialized</p>
                  <p className="font-mono text-xs">{repository.branch ?? "—"}</p>
                  <p className="font-mono text-xs">{shortSha(repository.head_sha)}</p>
                  <p className="text-muted-foreground">
                    {repository.remote_url ?? "No remote"}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Git is not initialized.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Build</CardTitle>
              <Button asChild size="sm" variant="ghost">
                <Link to={`/projects/${projectId}/builds`}>Open</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {build ? (
                <>
                  <StatusBadge value={build.status} />
                  <p className="font-mono text-xs">{shortSha(build.commit_sha)}</p>
                </>
              ) : (
                <p className="text-muted-foreground">No build yet.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>QA</CardTitle>
              <Button asChild size="sm" variant="ghost">
                <Link to={`/projects/${projectId}/qa`}>Open</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {qa ? (
                <>
                  <StatusBadge value={qa.status} />
                  <p>Preview ready: {qa.preview_ready ? "YES" : "NO"}</p>
                </>
              ) : (
                <p className="text-muted-foreground">No QA report yet.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Deployment</CardTitle>
              <Button asChild size="sm" variant="ghost">
                <Link to={`/projects/${projectId}/deployments`}>Open</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {deployment ? (
                <>
                  <StatusBadge value={deployment.status} />
                  <p>{deployment.environment ?? "preview"}</p>
                  {deployment.url ? (
                    <a className="text-primary hover:underline" href={deployment.url} target="_blank" rel="noreferrer">
                      {deployment.url}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">No preview URL</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No deployment yet.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Latest job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {latestJob ? (
                <>
                  <p>{latestJob.operation}</p>
                  <StatusBadge value={latestJob.status} />
                  {latestJob.error_code ? (
                    <p className="font-mono text-xs text-destructive">{latestJob.error_code}</p>
                  ) : null}
                </>
              ) : (
                <p className="text-muted-foreground">No jobs recorded in the summary.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
