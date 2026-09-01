import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("secret safety", () => {
  it("does not introduce a browser-visible SiteGen token env var", () => {
    const viteConfig = readFileSync(join(root, "vite.config.ts"), "utf8");
    const envExample = readFileSync(join(root, ".env.example"), "utf8");
    const source = `${viteConfig}\n${envExample}`;
    expect(source).not.toMatch(/VITE_SITEGEN_API_TOKEN/);
    expect(envExample).toMatch(/^SITEGEN_API_TOKEN=/m);
    expect(envExample).not.toMatch(/^VITE_/m);
  });
});
