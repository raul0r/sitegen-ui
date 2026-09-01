import { describe, expect, it } from "vitest";

import {
  buildUpstreamUrl,
  filterRequestHeaders,
  missingProxyConfigError,
  resolveProxyConfig,
  upstreamHostHeader,
} from "./sitegen-proxy";

describe("sitegen proxy", () => {
  it("fails closed without a token", () => {
    expect(resolveProxyConfig({ baseUrl: "http://127.0.0.1:8000", token: "" })).toBeNull();
    expect(missingProxyConfigError("missing").error.code).toBe("authentication_not_configured");
  });

  it("forwards /api paths onto the SiteGen origin", () => {
    expect(buildUpstreamUrl("http://127.0.0.1:8000", "/api/v1/projects")).toBe(
      "http://127.0.0.1:8000/api/v1/projects",
    );
  });

  it("rewrites host.docker.internal to a Django-allowed Host header", () => {
    expect(upstreamHostHeader("http://host.docker.internal:8000")).toBe("127.0.0.1:8000");
    expect(upstreamHostHeader("http://127.0.0.1:8000")).toBe("127.0.0.1:8000");
  });

  it("injects the server token and strips incoming authorization", () => {
    const headers = filterRequestHeaders(
      { Authorization: "Bearer browser-token", Accept: "application/json" },
      "server-token",
    );
    expect(headers.get("Authorization")).toBe("Bearer server-token");
    expect(headers.get("Accept")).toBe("application/json");
  });
});
