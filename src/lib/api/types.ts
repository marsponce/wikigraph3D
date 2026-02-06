// src/lib/api/types.ts

import { GraphNode } from "@/types";

/**
 * Standard API error response format
 */
export interface ApiError {
  error: string;
  code?: string;
  status?: number;
}

/**
 * API Response types for each endpoint
 */
export interface TodayNodeResponse {
  node: GraphNode;
}

export interface NodeResponse {
  node: GraphNode;
}

export interface LinkedNodesResponse {
  nodes: GraphNode[];
}

export interface InfoResponse {
  html: string;
}

export interface ArticleResponse {
  html: string;
}

/**
 * Generic API response wrapper
 */
export type ApiResponse<T> = T | ApiError;

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as ApiError).error === "string"
  );
}
