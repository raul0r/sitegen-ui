import { describe, expect, it } from "vitest";

import { normalizeApiError } from "./errors";

describe("normalizeApiError", () => {
  it("maps SiteGen structured errors", () => {
    const error = normalizeApiError(
      401,
      {
        error: {
          code: "authentication_required",
          message: "A valid bearer token is required.",
          retryable: false,
        },
      },
      "req-1",
    );
    expect(error.status).toBe(401);
    expect(error.code).toBe("authentication_required");
    expect(error.message).toBe("A valid bearer token is required.");
    expect(error.requestId).toBe("req-1");
    expect(error.retryable).toBe(false);
  });

  it("treats 503 as retryable when unspecified", () => {
    const error = normalizeApiError(503, { message: "down" });
    expect(error.retryable).toBe(true);
  });
});
