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
import { useProjectSummary } from "@/features/projects/use-projects";
import { sitegen } from "@/lib/api/sitegen";
import { formatDateTime, shortSha } from "@/lib/format/status";
import { queryKeys } from "@/lib/query/keys";

export function DeploymentsPage() {
  const { projectId = "" } = useParams();
  const queryClient = useQueryClient();
  const summary = useProjectSummary(projectId);
  const [jobId, setJobId] = useState<string | null>(null);
  const deployments = useQuery({
    queryKey: queryKeys.deployments(projectId),
    queryFn: () => sitegen.listDeployments(projectId),
    enabled: Boolean(projectId),
  });
  const job = useJob(jobId, () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.deployments(projectId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.projectSummary(projectId) });
  });
  const preview = useMutation({
    mutationFn: () => sitegen.deployPreview(projectId, {}),
    onSuccess: (queued) => {
      setJobId(queued.job.id);
      toast.message("Preview deployment queued");
    },
  });
  const refresh = useMutation({
    mutationFn: (deploymentId: string) => sitegen.refreshDeployment(projectId, deploymentId),
    onSuccess: (queued) => {
      setJobId(queued.job.id);
      toast.message("Deployment refresh queued");
    },
  });
  const history = [...(deployments.data ?? [])].sort(
    (left, right) => Date.parse(right.created_at) - Date.parse(left.created_at),
  );
  const latest = history[0];
  const latestUrl = history.find((item) => Boolean(item.url)) ?? latest;
  const buildId = (summary.data?.build as { id?: string } | null | undefined)?.id;

  const liveQa = useMutation({
    mutationFn: async () => {
      if (!buildId) throw new Error("A build is required before live QA.");
      if (!latestUrl?.url) throw new Error("A preview URL is required before live QA.");
      return sitegen.runQa(projectId, {
        build_id: buildId,
        target_url: latestUrl.url,
        routes: ["/"],
      });
    },
    onSuccess: (queued) => {
      setJobId(queued.job.id);
      toast.message("Live QA queued");
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Deployments"
        description="Preview only. Production, custom domains, and DNS are out of V1 scope."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void deployments.refetch()}>
              Refresh
            </Button>
            <Button size="sm" disabled={preview.isPending} onClick={() => preview.mutate()}>
              Deploy Preview
            </Button>
            {latest ? (
              <Button
                size="sm"
                variant="outline"
                disabled={refresh.isPending}
                onClick={() => refresh.mutate(latest.id)}
              >
                Refresh Deployment
              </Button>
            ) : null}
            {latestUrl?.url ? (
              <Button asChild size="sm" variant="outline">
                <a href={latestUrl.url} target="_blank" rel="noreferrer">
                  Open Preview
                </a>
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              disabled={!latestUrl?.url || liveQa.isPending}
              onClick={() => liveQa.mutate()}
            >
              Run Live QA
            </Button>
          </>
        }
      />
      {preview.error ? <ErrorState error={preview.error} /> : null}
      {refresh.error ? <ErrorState error={refresh.error} /> : null}
      {liveQa.error ? <ErrorState error={liveQa.error} /> : null}
      {job.data ? (
        <JobProgress
          job={job.data}
          onRetry={() => {
            void sitegen.retryJob(job.data.id).then((queued) => setJobId(queued.id));
          }}
          onCancel={() => {
            void sitegen.cancelJob(job.data.id);
          }}
        />
      ) : null}
      {deployments.isLoading ? <LoadingSkeleton /> : null}
      {deployments.error ? (
        <ErrorState error={deployments.error} onRetry={() => void deployments.refetch()} />
      ) : null}
      {deployments.data && deployments.data.length === 0 ? (
        <EmptyState
          title="No deployments"
          description="Publish GitHub, then deploy a Cloudflare preview. Production is not available in this UI."
        />
      ) : null}
      {deployments.data && deployments.data.length > 0 ? (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Environment</th>
                <th className="px-3 py-2">Provider project</th>
                <th className="px-3 py-2">Branch</th>
                <th className="px-3 py-2">Commit</th>
                <th className="px-3 py-2">URL</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2">
                    <StatusBadge value={item.status} />
                  </td>
                  <td className="px-3 py-2">{item.environment}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {item.provider_project_name || item.provider_project_id || "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{item.branch || "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{shortSha(item.commit_sha)}</td>
                  <td className="px-3 py-2">
                    {item.url ? (
                      <a className="text-primary hover:underline" href={item.url} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatDateTime(item.created_at)}
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
