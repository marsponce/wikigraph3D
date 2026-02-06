// src/lib/api.ts
import { API, API_ROUTES } from "./constants";

type apiFetchArgs<T> = {
  route: string;
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
  if (!Object.values(API_ROUTES).includes(route))
    throw new Error(`route: ${route} is not a valid api route!`);

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
    } catch (error) {
      console.error(`${url} failed attempt ${i} / ${retries}`);
      lastError = error as Error;
      // exponential backoff
      if (i <= retries - 1)
        await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
    }
  }
  throw lastError;
}
