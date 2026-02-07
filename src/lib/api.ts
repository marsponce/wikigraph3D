// src/lib/api.ts
import { API, API_ROUTES, ApiRoute } from "@/lib/constants";

type apiFetchArgs<T> = {
  route: ApiRoute;
  params?: Record<string, string>;
  options?: RequestInit;
  retries?: number;
};

export async function apiFetch<T>({
  route,
  params,
  options,
  retries = 3,
}: apiFetchArgs<T>): Promise<T> {
  // Check route validity
  if (!Object.values(API_ROUTES).includes(route)) {
    const allowedRoutes = Object.values(API_ROUTES).join(", ");
    throw new Error(
      `Invalid API route "${route}". Allowed routes are: ${allowedRoutes}`,
    );
  }

  // Create URL
  let url = API + route;
  if (params) url += "?" + new URLSearchParams(params).toString();

  // Make a maximum of `retries` many requests.
  let lastError = new Error(`${url} failed attempt 0 / ${retries}`);
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`http: ${res.status}: ${res.statusText}`);
      return await res.json();
    } catch (error: unknown) {
      console.error(`${url} failed attempt ${i} / ${retries}:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      if (error instanceof Error) {
        const status = parseInt(error.message.match(/\d{3}/)?.[0] || "0");
        if (status >= 400 && status < 500 && status !== 429) {
          console.error(`${url} failed with non-retriable error:`, error);
          throw error; // Don't retry
        }
      }
      // exponential backoff
      if (i <= retries - 1)
        await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
    }
  }
  throw lastError;
}
