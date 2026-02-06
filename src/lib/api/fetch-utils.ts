// src/lib/api/fetch-utils.ts

import { isApiError } from "./types";

/**
 * Options for the centralized fetch utility
 */
export interface FetchOptions extends RequestInit {
  /**
   * Timeout in milliseconds (default: 10000)
   */
  timeout?: number;
}

/**
 * Custom error class for API errors
 */
export class ApiFetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiFetchError";
  }
}

/**
 * Centralized fetch utility with automatic error handling
 *
 * Features:
 * - Automatic JSON parsing
 * - Consistent error handling
 * - Timeout support
 * - Type-safe responses
 *
 * @param url - The URL to fetch
 * @param options - Fetch options including custom timeout
 * @returns Parsed JSON response
 * @throws ApiFetchError on failure
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse JSON response
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new ApiFetchError(
        `Failed to parse JSON response from ${url}`,
        response.status,
        "PARSE_ERROR",
      );
    }

    // Check if response is an API error
    if (isApiError(data)) {
      throw new ApiFetchError(
        data.error,
        data.status || response.status,
        data.code,
      );
    }

    // Check HTTP status
    if (!response.ok) {
      throw new ApiFetchError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        "HTTP_ERROR",
      );
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiFetchError(
        `Request timeout after ${timeout}ms`,
        0,
        "TIMEOUT",
      );
    }

    // Re-throw ApiFetchError
    if (error instanceof ApiFetchError) {
      throw error;
    }

    // Handle network errors
    throw new ApiFetchError(
      `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      0,
      "NETWORK_ERROR",
    );
  }
}
