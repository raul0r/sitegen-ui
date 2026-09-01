import { useQuery } from "@tanstack/react-query";

import { sitegen } from "@/lib/api/sitegen";
import { queryKeys } from "@/lib/query/keys";

export function useCapabilities() {
  return useQuery({
    queryKey: queryKeys.capabilities,
    queryFn: sitegen.capabilities,
  });
}
