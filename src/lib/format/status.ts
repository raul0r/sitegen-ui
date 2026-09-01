export function displayStatus(value: string | undefined | null): string {
  if (!value) return "Unknown";
  const map: Record<string, string> = {
    pending: "Queued",
    queued: "Queued",
    running: "Running",
    succeeded: "Succeeded",
    failed: "Failed",
    canceled: "Cancelled",
    cancelled: "Cancelled",
    active: "Active",
    archived: "Archived",
    available: "Available",
    unavailable: "Unavailable",
    configured: "Configured",
    unconfigured: "Not configured",
    validated: "Validated",
    preview: "Preview",
    production: "Production",
  };
  return map[value] ?? value.replaceAll("_", " ");
}

export function statusTone(
  value: string | undefined | null,
): "success" | "warning" | "destructive" | "muted" | "default" {
  switch (value) {
    case "succeeded":
    case "available":
    case "configured":
    case "validated":
    case "active":
      return "success";
    case "running":
    case "queued":
    case "pending":
      return "warning";
    case "failed":
    case "unavailable":
    case "canceled":
    case "cancelled":
      return "destructive";
    case "unconfigured":
      return "muted";
    default:
      return "default";
  }
}

export function shortSha(value: string | null | undefined): string {
  if (!value) return "—";
  return value.slice(0, 7);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}m ${rest}s`;
}

export function capabilityLabel(key: string): string {
  const labels: Record<string, string> = {
    local_git: "Git",
    node: "Node",
    astro_build: "Astro",
    browser_qa: "Playwright",
    lighthouse: "Lighthouse",
    celery_worker: "Celery worker",
    database: "PostgreSQL",
    redis: "Redis",
    github: "GitHub",
    cloudflare: "Cloudflare",
    docker: "Docker",
  };
  return labels[key] ?? key.replaceAll("_", " ");
}
