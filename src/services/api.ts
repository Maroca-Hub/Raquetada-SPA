const baseUrl = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type Api = ReturnType<typeof createApi>;

export function createApi(getToken: () => string | undefined) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = getToken();
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new ApiError(response.status, body.error ?? response.statusText);
    }

    return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) =>
      request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
    del: (path: string) => request<void>(path, { method: "DELETE" }),
  };
}
