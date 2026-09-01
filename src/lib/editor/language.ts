import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import type { Extension } from "@codemirror/state";

export function languageForPath(path: string): Extension[] {
  const lower = path.toLowerCase();
  if (lower.endsWith(".json")) return [json()];
  if (lower.endsWith(".md") || lower.endsWith(".mdx")) return [markdown()];
  if (lower.endsWith(".css")) return [css()];
  if (lower.endsWith(".html") || lower.endsWith(".astro")) return [html()];
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) {
    return [javascript({ typescript: true, jsx: lower.endsWith("x") })];
  }
  if (lower.endsWith(".js") || lower.endsWith(".jsx") || lower.endsWith(".mjs")) {
    return [javascript({ jsx: lower.endsWith("x") })];
  }
  return [];
}
