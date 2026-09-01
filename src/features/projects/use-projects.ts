import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { sitegen } from "@/lib/api/sitegen";
import type { ProjectCreate } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: sitegen.listProjects,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => sitegen.getProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useProjectSummary(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectSummary(projectId),
    queryFn: () => sitegen.getSummary(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProjectCreate) => sitegen.createProject(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}
