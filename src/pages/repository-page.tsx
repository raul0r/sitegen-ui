import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";

import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/feedback/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobProgress } from "@/features/jobs/job-progress";
import { useJob } from "@/features/jobs/use-job";
import { useProjectSummary } from "@/features/projects/use-projects";
import { sitegen } from "@/lib/api/sitegen";
import type { Job, RepositorySummary } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";
import { shortSha } from "@/lib/format/status";

export function RepositoryPage() {
  const { projectId = "" } = useParams();
  const queryClient = useQueryClient();
  const summary = useProjectSummary(projectId);
  const sourceControl = useQuery({
    queryKey: queryKeys.sourceControl(projectId),
    queryFn: () => sitegen.getSourceControl(projectId),
    enabled: Boolean(projectId),
  });
  const [jobId, setJobId] = useState<string | null>(null);
  const [branch, setBranch] = useState("sitegen/build");
  const [message, setMessage] = useState("checkpoint");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");

  const job = useJob(jobId, () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.projectSummary(projectId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.sourceControl(projectId) });
  });

  const run = useMutation({
    mutationFn: async (operation: () => Promise<Job>) => operation(),
    onSuccess: (created) => {
      setJobId(created.id);
      toast.message(`${created.operation} queued`);
    },
  });

  const repository = summary.data?.repository as RepositorySummary | null | undefined;
  const initialized = Boolean(repository?.initialized);
  const hasRemote = Boolean(repository?.remote_url || sourceControl.data?.remote_url);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Repository"
        description="Safe Git operations through SiteGen. No force-push, reset, or rebase."
        actions={
          <Button variant="outline" size="sm" onClick={() => void summary.refetch()}>
            Refresh
          </Button>
        }
      />
      {summary.isLoading ? <LoadingSkeleton /> : null}
      {summary.error ? (
        <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Current state</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1 text-sm md:grid-cols-2">
          <p data-testid="repo-initialized">Initialized: {initialized ? "yes" : "no"}</p>
          <p data-testid="repo-branch">
            Branch: {repository?.branch || summary.data?.project.working_branch || "—"}
          </p>
          <p className="font-mono text-xs" data-testid="repo-head">
            HEAD {shortSha(repository?.head_sha)}
          </p>
          <p data-testid="repo-remote">
            Remote: {repository?.remote_url || sourceControl.data?.remote_url || "none"}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Initialize Git</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              disabled={initialized || run.isPending}
              onClick={() => run.mutate(() => sitegen.initRepository(projectId))}
            >
              Initialize Git
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Refresh status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-xs text-muted-foreground">
              SiteGen queues a repository.status job (GAP-004). Summary is the synchronous snapshot.
            </p>
            <Button
              size="sm"
              variant="outline"
              disabled={run.isPending}
              onClick={() => run.mutate(() => sitegen.refreshRepositoryStatus(projectId))}
            >
              Refresh repository status
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create Branch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Input id="branch" value={branch} onChange={(event) => setBranch(event.target.value)} />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!initialized || !branch || run.isPending}
                onClick={() =>
                  run.mutate(() => sitegen.createBranch(projectId, { branch }))
                }
              >
                Create Branch
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!initialized || !branch || run.isPending}
                onClick={() =>
                  run.mutate(() => sitegen.checkoutBranch(projectId, { branch }))
                }
              >
                Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create Checkpoint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="checkpoint-message">Message</Label>
            <Input
              id="checkpoint-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <Button
              size="sm"
              disabled={!initialized || !message || run.isPending}
              onClick={() =>
                run.mutate(() => sitegen.checkpoint(projectId, { message }))
              }
            >
              Create Checkpoint
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Publish GitHub</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input id="owner" value={owner} onChange={(event) => setOwner(event.target.value)} />
            <Label htmlFor="repo">Repository name</Label>
            <Input id="repo" value={repoName} onChange={(event) => setRepoName(event.target.value)} />
            <Button
              size="sm"
              disabled={!initialized || !owner || !repoName || run.isPending}
              onClick={() =>
                run.mutate(() =>
                  sitegen.publishGitHub(projectId, { owner, name: repoName, private: true }),
                )
              }
            >
              Publish GitHub
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Push Branch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {hasRemote
                ? "Remote is configured."
                : "Publish this project to GitHub before pushing, or set a remote URL."}
            </p>
            <Label htmlFor="remote">Remote URL (optional)</Label>
            <Input
              id="remote"
              value={remoteUrl}
              onChange={(event) => setRemoteUrl(event.target.value)}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!initialized || !remoteUrl || run.isPending}
                onClick={() =>
                  run.mutate(() => sitegen.configureRemote(projectId, { url: remoteUrl }))
                }
              >
                Set remote
              </Button>
              <Button
                size="sm"
                disabled={!initialized || !branch || run.isPending}
                onClick={() => run.mutate(() => sitegen.pushBranch(projectId, { branch }))}
              >
                Push Branch
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {run.error ? <ErrorState error={run.error} /> : null}
      {job.data ? (
        <JobProgress
          job={job.data}
          onRetry={() =>
            run.mutate(async () => {
              const retried = await sitegen.retryJob(job.data.id);
              return retried;
            })
          }
          onCancel={() =>
            run.mutate(async () => {
              const canceled = await sitegen.cancelJob(job.data.id);
              return canceled;
            })
          }
        />
      ) : null}
    </div>
  );
}
