import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/feedback/page-header";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import { JobProgress } from "@/features/jobs/job-progress";
import { useJob } from "@/features/jobs/use-job";
import { sitegen } from "@/lib/api/sitegen";
import { formatDateTime, formatDuration, shortSha } from "@/lib/format/status";
import { queryKeys } from "@/lib/query/keys";

export function BuildsPage() {
  const { projectId = "" } = useParams();
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState<string | null>(null);
  const builds = useQuery({
    queryKey: queryKeys.builds(projectId),
    queryFn: () => sitegen.listBuilds(projectId),
    enabled: Boolean(projectId),
  });
  const job = useJob(jobId, () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.builds(projectId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.projectSummary(projectId) });
  });
  const runBuild = useMutation({
    mutationFn: () => sitegen.runBuild(projectId),
    onSuccess: (queued) => {
      setJobId(queued.job.id);
      toast.message("Build queued");
    },
  });
  const install = useMutation({
    mutationFn: () => sitegen.installDependencies(projectId),
    onSuccess: (queued) => {
      setJobId(queued.id);
      toast.message("Dependency installation queued");
    },
  });
  const retry = useMutation({
    mutationFn: (id: string) => sitegen.retryJob(id),
    onSuccess: (queued) => setJobId(queued.id),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => sitegen.cancelJob(id),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.job(updated.id) });
    },
  });

  const history = [...(builds.data ?? [])].sort(
    (left, right) => Date.parse(right.created_at) - Date.parse(left.created_at),
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Builds"
        description="Queue a real Astro build. Status comes from SiteGen, not log parsing."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void builds.refetch()}>
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={install.isPending}
              onClick={() => install.mutate()}
            >
              Install Dependencies
            </Button>
            <Button size="sm" disabled={runBuild.isPending} onClick={() => runBuild.mutate()}>
              Run Build
            </Button>
          </>
        }
      />
      {runBuild.error ? <ErrorState error={runBuild.error} /> : null}
      {install.error ? <ErrorState error={install.error} /> : null}
      {job.data ? (
        <JobProgress
          job={job.data}
          onRetry={() => retry.mutate(job.data.id)}
          onCancel={() => cancel.mutate(job.data.id)}
        />
      ) : null}
      {builds.isLoading ? <LoadingSkeleton /> : null}
      {builds.error ? (
        <ErrorState error={builds.error} onRetry={() => void builds.refetch()} />
      ) : null}
      {history.length === 0 && !builds.isLoading ? (
        <EmptyState title="No builds" description="Install dependencies, then run a build." />
      ) : null}
      {history.length > 0 ? (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Commit</th>
                <th className="px-3 py-2">Branch</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2">Exit</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {history.map((build) => (
                <tr key={build.id} className="border-t">
                  <td className="px-3 py-2">
                    <StatusBadge value={build.status} />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{shortSha(build.commit_sha)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{build.branch || "—"}</td>
                  <td className="px-3 py-2">{formatDuration(build.duration_ms)}</td>
                  <td className="px-3 py-2">{build.exit_code ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatDateTime(build.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
