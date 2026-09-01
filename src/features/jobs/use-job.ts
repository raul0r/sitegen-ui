import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { sitegen } from "@/lib/api/sitegen";
import { isTerminalJobStatus } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";

export function useJob(jobId: string | null, onTerminal?: () => void) {
  const queryClient = useQueryClient();
  const onTerminalRef = useRef(onTerminal);
  const completedKey = useRef<string | null>(null);
  onTerminalRef.current = onTerminal;

  const query = useQuery({
    queryKey: jobId ? queryKeys.job(jobId) : ["job", "idle"],
    queryFn: () => sitegen.getJob(jobId as string),
    enabled: Boolean(jobId),
    refetchInterval: (current) =>
      isTerminalJobStatus(current.state.data?.status) ? false : 1500,
  });

  useEffect(() => {
    if (!jobId || !isTerminalJobStatus(query.data?.status)) return;
    const key = `${jobId}:${query.data?.status}`;
    if (completedKey.current === key) return;
    completedKey.current = key;
    onTerminalRef.current?.();
    void queryClient.invalidateQueries({ queryKey: queryKeys.projects });
  }, [jobId, query.data?.status, queryClient]);

  return query;
}
