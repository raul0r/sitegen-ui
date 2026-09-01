import { describe, expect, it } from "vitest";

import { isTerminalJobStatus } from "./types";

describe("isTerminalJobStatus", () => {
  it("stops polling on SiteGen terminal states", () => {
    expect(isTerminalJobStatus("succeeded")).toBe(true);
    expect(isTerminalJobStatus("failed")).toBe(true);
    expect(isTerminalJobStatus("canceled")).toBe(true);
    expect(isTerminalJobStatus("running")).toBe(false);
    expect(isTerminalJobStatus("queued")).toBe(false);
    expect(isTerminalJobStatus("pending")).toBe(false);
  });
});
