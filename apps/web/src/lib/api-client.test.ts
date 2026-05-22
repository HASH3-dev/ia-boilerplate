import { describe, it, expect, vi, beforeEach } from "vitest";
import { callApi } from "./api-client";
import { RouterError } from "@/app/api/(resourses)/errors/router-error";
import { SESSION_EXPIRED_CODE } from "./session-expired";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("callApi", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("makes a request to the backend API base URL + path", async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 200 }));

    await callApi("/items", { method: "GET" });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/items");
  });

  it("adds Authorization header when accessToken is provided", async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 200 }));

    await callApi("/items", { method: "GET" }, "my-token");

    const [, init] = mockFetch.mock.calls[0];
    const headers = init.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer my-token");
  });

  it("does not add Authorization header when no token is provided", async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 200 }));

    await callApi("/items", { method: "GET" });

    const [, init] = mockFetch.mock.calls[0];
    const headers = init.headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
  });

  it("throws RouterError with SESSION_EXPIRED_CODE on 401 response", async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 401 }));

    let caughtError: unknown;
    try {
      await callApi("/items", { method: "GET" });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(RouterError);
    const routerError = caughtError as RouterError;
    expect(routerError.status).toBe(401);
    expect(routerError.details).toEqual({ code: SESSION_EXPIRED_CODE });
  });

  it("returns response for non-401 status codes", async () => {
    const mockResponse = new Response(JSON.stringify({ id: 1 }), {
      status: 200,
    });
    mockFetch.mockResolvedValueOnce(mockResponse);

    const result = await callApi("/items", { method: "GET" });

    expect(result.status).toBe(200);
  });
});
