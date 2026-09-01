import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SystemPage } from "./system-page";

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <SystemPage />
    </QueryClientProvider>,
  );
}

describe("SystemPage", () => {
  it("renders live capability states without assuming success", async () => {
    renderPage();
    expect(await screen.findByText("Git")).toBeInTheDocument();
    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getAllByText(/unavailable/i).length).toBeGreaterThan(0);
  });
});
