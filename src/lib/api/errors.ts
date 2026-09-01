export type UiApiErrorBody = {
  status: number;
  code?: string;
  message: string;
  requestId?: string;
  retryable?: boolean;
  details?: unknown;
};

export class UiApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly retryable: boolean;
  readonly details?: unknown;

  constructor(body: UiApiErrorBody) {
    super(body.message);
    this.name = "UiApiError";
    this.status = body.status;
    this.code = body.code;
    this.requestId = body.requestId;
    this.retryable = body.retryable ?? false;
    this.details = body.details;
  }
}

type SiteGenErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    retryable?: boolean;
    details?: unknown;
    request_id?: string;
    job_id?: string;
  };
  detail?: string;
  message?: string;
};

export function isUiApiError(error: unknown): error is UiApiError {
  return error instanceof UiApiError;
}

export function normalizeApiError(
  status: number,
  payload: unknown,
  requestId?: string,
): UiApiError {
  const data = (payload ?? {}) as SiteGenErrorPayload;
  const nested = data.error;
  const message =
    nested?.message ||
    data.detail ||
    data.message ||
    defaultMessage(status);
  const code = nested?.code;
  const retryable =
    nested?.retryable ?? (status === 502 || status === 503 || status === 429);

  return new UiApiError({
    status,
    code,
    message,
    requestId: nested?.request_id || requestId,
    retryable,
    details: nested?.details,
  });
}

function defaultMessage(status: number): string {
  if (status === 401) return "A valid bearer token is required.";
  if (status === 403) return "This operation is not authorized.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 409) return "The project is not in a valid state for this operation.";
  if (status === 502 || status === 503) return "SiteGen is unavailable.";
  return "The request failed.";
}

export function errorCopy(error: unknown): {
  title: string;
  message: string;
  code?: string;
  requestId?: string;
  retryable: boolean;
} {
  if (isUiApiError(error)) {
    return {
      title: titleForStatus(error.status, error.code),
      message: error.message,
      code: error.code,
      requestId: error.requestId,
      retryable: error.retryable,
    };
  }
  if (error instanceof Error) {
    return {
      title: "Request failed",
      message: error.message,
      retryable: true,
    };
  }
  return {
    title: "Request failed",
    message: "An unexpected error occurred.",
    retryable: true,
  };
}

function titleForStatus(status: number, code?: string): string {
  if (code === "authentication_not_configured") return "Not configured";
  if (code === "authentication_required") return "Unauthorized";
  if (code === "upstream_unavailable") return "Unavailable";
  if (status === 401) return "Unauthorized";
  if (status === 404) return "Not found";
  if (status === 409) return "Conflict";
  if (status === 502 || status === 503) return "Unavailable";
  return "Request failed";
}
