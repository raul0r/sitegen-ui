import { describe, expect, it } from "vitest";

import { looksLikeHostPath, redactSecrets } from "./redact";

describe("redactSecrets", () => {
  it("redacts bearer tokens and github pats", () => {
    expect(redactSecrets("Authorization: Bearer abcdef0123456789")).toContain("[redacted]");
    expect(redactSecrets("token=super-secret-value")).toContain("[redacted]");
    expect(redactSecrets("ghp_abcdefghijklmnopqrstuvwxyz123456")).toContain("[redacted]");
  });
});

describe("looksLikeHostPath", () => {
  it("detects SiteGen workspace paths", () => {
    expect(
      looksLikeHostPath("/data/sitegen/projects/abc/.sitegen/qa/root.png"),
    ).toBe(true);
    expect(looksLikeHostPath("https://example.com/preview")).toBe(false);
  });
});
