// src/lib/utils.ts
import type { MediaWikiResponse, Page, GraphNode } from "@/types/wikipedia";

// Convert a page object into a Node object
// NOTE: This function does not work with the today route completeley -> see src/app/api/wikipedia/today/route.ts
export function normalizePageToNode(page: Page): GraphNode {
  return {
    id: page.pageid ?? page.id,
    name: page.title,
    thumbnail: page.thumbnail ?? null,
    content: {
      desktop: {
        page: page.fullurl ?? null,
        edit: page.editurl ?? null,
        canonical: page.canonicalurl ?? null,
      },
      mobile: {
        page:
          page.fullurl?.replace("en.wikipedia.org", "en.m.wikipedia.org") ??
          null,
        edit:
          page.editurl?.replace("en.wikipedia.org", "en.m.wikipedia.org") ??
          null,
      },
    },
  };
}

export function normalizeMediaWikiResponse(
  response: MediaWikiResponse,
): GraphNode[] {
  if (!response.query?.pages) return [];

  return Object.values(response.query.pages).map(normalizePageToNode);
}

export function todaysDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayDate = `${year}-${month}-${day}`;
  return todayDate;
}
