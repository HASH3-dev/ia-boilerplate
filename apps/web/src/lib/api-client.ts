import 'server-only';
import { RouterError } from "@/app/api/(resourses)/errors/router-error";
import { SESSION_EXPIRED_CODE } from "./session-expired";

const API_BASE = process.env.BACKEND_API_BASE_URL ?? "http://localhost:3001";

export async function callApi(
  path: string,
  init: RequestInit,
  accessToken?: string,
): Promise<Response> {
  const headers = new Headers(init.headers as HeadersInit | undefined);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (response.status === 401) {
    throw new RouterError({
      status: 401,
      message: "Session expired",
      details: { code: SESSION_EXPIRED_CODE },
    });
  }

  return response;
}
