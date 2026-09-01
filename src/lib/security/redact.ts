const SECRET_PATTERNS: RegExp[] = [
  /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /\b(api[_-]?key|token|secret|password|passwd|authorization)\s*[:=]\s*["']?[^"'\s]+/gi,
  /\bghp_[A-Za-z0-9]{20,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
];

export function redactSecrets(value: string): string {
  let next = value;
  for (const pattern of SECRET_PATTERNS) {
    next = next.replace(pattern, "[redacted]");
  }
  return next;
}

export function looksLikeHostPath(value: string): boolean {
  return value.startsWith("/data/") || value.startsWith("/home/") || /^[A-Za-z]:\\/.test(value);
}
