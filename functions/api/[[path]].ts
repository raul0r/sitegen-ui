type PagesEnv = {
  SITEGEN_API_BASE_URL?: string;
  SITEGEN_API_TOKEN?: string;
};

type PagesContext = {
  request: Request;
  env: PagesEnv;
  params: { path?: string | string[] };
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

function jsonError(status: number, code: string, message: string, retryable: boolean) {
  return Response.json(
    { error: { code, message, retryable } },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function outgoingHeaders(request: Request, token: string): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower === "authorization" || lower === "cookie") {
      return;
    }
    headers.set(key, value);
  });
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const baseUrl = (context.env.SITEGEN_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
  const token = (context.env.SITEGEN_API_TOKEN ?? "").trim();

  if (!baseUrl || !token) {
    return jsonError(
      503,
      "authentication_not_configured",
      "The SiteGen API token is not configured on the UI server.",
      false,
    );
  }

  const incoming = new URL(context.request.url);
  const upstreamUrl = `${baseUrl}${incoming.pathname}${incoming.search}`;
  const headers = outgoingHeaders(context.request, token);
  try {
    const upstreamHost = new URL(baseUrl.includes("://") ? baseUrl : `http://${baseUrl}`);
    if (upstreamHost.hostname === "host.docker.internal") {
      headers.set("Host", upstreamHost.port ? `127.0.0.1:${upstreamHost.port}` : "127.0.0.1");
    }
  } catch {
    /* keep fetch-derived host */
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method: context.request.method,
      headers,
      body:
        context.request.method === "GET" || context.request.method === "HEAD"
          ? undefined
          : await context.request.arrayBuffer(),
      redirect: "manual",
    });

    const headers = new Headers();
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (HOP_BY_HOP.has(lower) || lower === "authorization" || lower === "set-cookie") {
        return;
      }
      headers.set(key, value);
    });
    headers.set("Cache-Control", "no-store");

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch {
    return jsonError(
      502,
      "upstream_unavailable",
      "SiteGen is unavailable. Retry after the API is reachable.",
      true,
    );
  }
};
