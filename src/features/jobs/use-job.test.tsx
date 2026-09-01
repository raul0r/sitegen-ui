import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { resetStore, setJobStatus } from "@/test/msw/handlers";

import { useJob } from "./use-job";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useJob", () => {
  afterEach(() => {
    resetStore();
    vi.useRealTimers();
  });

  it("polls while running and stops at a terminal status", async () => {
    setJobStatus("running");
    const { result } = renderHook(() => useJob("11111111-2222-3333-4444-555555555555"), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.data?.status).toBe("running");
    });
    setJobStatus("succeeded");
    await waitFor(
      () => {
        expect(result.current.data?.status).toBe("succeeded");
      },
      { timeout: 5000 },
    );
  });
});
