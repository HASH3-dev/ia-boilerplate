import { SESSION_EXPIRED_CODE } from "./session-expired";

export async function bffFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status === 401) {
    const body = await response.clone().json().catch(() => ({}));
    if (body?.code === SESSION_EXPIRED_CODE) {
      // Avoid redirect loop: handles /signin and locale-prefixed paths like /en/signin
      if (window.location.pathname.endsWith("/signin")) {
        return response;
      }

      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/signin?redirect=${encodeURIComponent(currentPath)}`;
      // Return a never-resolving promise to prevent the caller from processing
      // the error response while the redirect is happening
      return new Promise(() => {});
    }
  }

  return response;
}
