/** Normalize API / validation errors for display (avoids rendering objects as React children). */
export function toUserFacingErrorMessage(err: unknown, fallback: string): string {
  if (err == null) return fallback;
  if (typeof err === "string") return err;
  const anyErr = err as {
    message?: string;
    response?: { data?: { error?: unknown; message?: string } };
  };
  const raw = anyErr.response?.data?.error ?? anyErr.response?.data?.message ?? anyErr.message;
  if (typeof raw === "string") return raw;
  if (raw != null && typeof raw === "object") {
    const o = raw as { message?: string; code?: string };
    if (typeof o.message === "string") return o.message;
  }
  if (anyErr.message) return String(anyErr.message);
  return fallback;
}

export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}