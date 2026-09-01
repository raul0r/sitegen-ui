import http from "node:http";
import https from "node:https";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

export type SiteGenProxyOptions = {
  baseUrl: string;
  token: string;
};

export type ProxyEnv = {
  SITEGEN_API_BASE_URL?: string;
  SITEGEN_API_TOKEN?: string;
};

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

const FORBIDDEN_REQUEST_HEADERS = new Set(["authorization", "cookie"]);

export function missingProxyConfigError(message: string) {
  return {
    error: {
      code: "authentication_not_configured",
      message,
      retryable: false,
    },
  };
}

export function upstreamUnavailableError(message: string) {
  return {
    error: {
      code: "upstream_unavailable",
      message,
      retryable: true,
    },
  };
}

export function resolveProxyConfig(options: SiteGenProxyOptions): {
  baseUrl: string;
  token: string;
} | null {
  const baseUrl = options.baseUrl.trim().replace(/\/+$/, "");
  const token = options.token.trim();
  if (!baseUrl || !token) {
    return null;
  }
  return { baseUrl, token };
}

export function buildUpstreamUrl(baseUrl: string, requestUrl: string): string {
  return new URL(requestUrl, `${baseUrl}/`).toString();
}

export function upstreamHostHeader(baseUrl: string): string {
  const url = new URL(baseUrl.includes("://") ? baseUrl : `http://${baseUrl}`);
  if (url.hostname === "host.docker.internal") {
    return url.port ? `127.0.0.1:${url.port}` : "127.0.0.1";
  }
  return url.host;
}

export function filterRequestHeaders(
  headers: Headers | Record<string, string> | undefined,
  token: string,
  requestId?: string,
): Headers {
  const outgoing = new Headers();
  const incoming = headers instanceof Headers ? headers : new Headers(headers);
  incoming.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || FORBIDDEN_REQUEST_HEADERS.has(lower)) {
      return;
    }
    outgoing.set(key, value);
  });
  outgoing.set("Authorization", `Bearer ${token}`);
  if (requestId && !outgoing.has("X-Request-ID")) {
    outgoing.set("X-Request-ID", requestId);
  }
  return outgoing;
}

function readRequestId(req: IncomingMessage): string | undefined {
  const value = req.headers["x-request-id"];
  return Array.isArray(value) ? value[0] : value;
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(payload);
}

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    return undefined;
  }
  return Buffer.concat(chunks);
}

export function sitegenProxyPlugin(options: SiteGenProxyOptions): Plugin {
  return {
    name: "sitegen-proxy",
    configureServer(server) {
      server.middlewares.use(createProxyMiddleware(options));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createProxyMiddleware(options));
    },
  };
}

export function createProxyMiddleware(options: SiteGenProxyOptions) {
  return async function sitegenProxy(
    req: IncomingMessage,
    res: ServerResponse,
    next: (error?: unknown) => void,
  ) {
    const url = req.url ?? "/";
    if (!url.startsWith("/api")) {
      next();
      return;
    }

    const config = resolveProxyConfig(options);
    if (!config) {
      sendJson(
        res,
        503,
        missingProxyConfigError(
          "The SiteGen API token is not configured on the UI server.",
        ),
      );
      return;
    }

    try {
      const body = await readBody(req);
      const requestHeaders = filterRequestHeaders(
        incomingNodeHeaders(req),
        config.token,
        readRequestId(req),
      );
      requestHeaders.set("Host", upstreamHostHeader(config.baseUrl));
      if (body && !requestHeaders.has("content-type") && req.headers["content-type"]) {
        requestHeaders.set("Content-Type", String(req.headers["content-type"]));
      }

      const upstream = await forwardToSiteGen({
        target: buildUpstreamUrl(config.baseUrl, url),
        method: req.method ?? "GET",
        headers: requestHeaders,
        body,
      });

      res.statusCode = upstream.status;
      for (const [key, value] of Object.entries(upstream.headers)) {
        const lower = key.toLowerCase();
        if (HOP_BY_HOP.has(lower) || lower === "authorization" || lower === "set-cookie") {
          continue;
        }
        if (value !== undefined) {
          res.setHeader(key, value);
        }
      }
      if (upstream.body.length > 0) {
        res.end(upstream.body);
      } else {
        res.end();
      }
    } catch {
      sendJson(
        res,
        502,
        upstreamUnavailableError("SiteGen is unavailable. Retry after the API is reachable."),
      );
    }
  };
}

function forwardToSiteGen(options: {
  target: string;
  method: string;
  headers: Headers;
  body?: Buffer;
}): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }> {
  const url = new URL(options.target);
  const lib = url.protocol === "https:" ? https : http;
  const headerObject: http.OutgoingHttpHeaders = { host: options.headers.get("Host") ?? url.host };
  options.headers.forEach((value, key) => {
    headerObject[key] = value;
  });
  if (options.body) {
    headerObject["content-length"] = options.body.length;
  }
  return new Promise((resolve, reject) => {
    const request = lib.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method: options.method,
        headers: headerObject,
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 502,
            headers: response.headers,
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    request.on("error", reject);
    if (options.body) {
      request.write(options.body);
    }
    request.end();
  });
}

function incomingNodeHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    } else {
      headers.set(key, value);
    }
  }
  return headers;
}
