// src/lib/api/endpoints.ts

import { API } from "@/lib/constants";

/**
 * API Endpoint Constants
 * Centralized definition of all API routes
 */
export const ENDPOINTS = {
  TODAY: `${API}/today`,
  LINK: `${API}/link`,
  LINKS: `${API}/links`,
  INFO: `${API}/info`,
  ARTICLE: `${API}/article`,
} as const;

/**
 * Build URL with query parameters
 */
export function buildUrl(
  endpoint: string,
  params?: Record<string, string | number>,
): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }

  const url = new URL(endpoint, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  return url.toString();
}
