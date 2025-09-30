// src/app/api/wikipedia/test/route.ts

import { NextResponse } from "next/server";
import { normalizePageToNode } from "@/lib/utils";
import { WIKI_API_BASE } from "@/lib/constants";

export async function getThumbnails(
  pages: Page[],
  batchSize: number = 50,
): Promise<Page[]> {
  // Filter pages missing thumbnails
  const missingThumbnail = pages.filter((p) => !p.thumbnail);
  if (missingThumbnail.length === 0) return pages;

  console.log(`Fetching thumbnails for ${missingThumbnail.length} pages...`);

  // Helper to split array into batches
  function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  const batches = chunkArray(missingThumbnail, batchSize);
  let thumbnailsFound = 0;

  for (const batch of batches) {
    const pageIds = batch.map((p) => p.pageid).join("|");
    const url = new URL(WIKI_API_BASE);
    url.searchParams.set("action", "query");
    url.searchParams.set("pageids", pageIds);
    url.searchParams.set("prop", "pageimages");
    url.searchParams.set("piprop", "thumbnail");
    url.searchParams.set("pithumbsize", "200");
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");

    try {
      const res = await fetch(url.toString());
      const data = await res.json();

      if (!data.query?.pages) continue;

      // Merge fetched thumbnails into original pages
      pages = pages.map((page) => {
        const fetched = data.query.pages[page.pageid];
        if (fetched?.thumbnail && !page.thumbnail) {
          thumbnailsFound++;
          return { ...page, thumbnail: fetched.thumbnail };
        }
        return page;
      });
    } catch (err) {
      console.error("Error fetching thumbnail batch:", err);
    }
  }

  console.log(
    `Found ${thumbnailsFound} new thumbnails out of ${missingThumbnail.length} pages without thumbnails`,
  );

  return pages;
}

async function fetchPages(title: string, limit: number = 10) {
  const pages: Page[] = [];
  let continueParams: Record<string, string> = {};
  let iterator = 0;

  console.log(`Fetching pages for title: ${title} and limit: ${limit}`);

  do {
    const url = new URL(WIKI_API_BASE);
    url.searchParams.set("action", "query");
    url.searchParams.set("generator", "links");
    url.searchParams.set("titles", title);
    url.searchParams.set("format", "json");
    url.searchParams.set("gpllimit", "max");
    url.searchParams.set("gplnamespace", "0"); // only main/article namespace
    url.searchParams.set("prop", "info|description|extracts");
    url.searchParams.set("inprop", "url");
    url.searchParams.set("pithumbsize", "200");
    url.searchParams.set("exintro", "true");
    url.searchParams.set("origin", "*");

    // Add continuation params if present
    for (const key in continueParams) {
      url.searchParams.set(key, continueParams[key]);
    }

    const res = await fetch(url.toString(), {});
    const data = await res.json();

    pages.push(...Object.values(data.query?.pages || {}));
    continueParams = data.continue || {};
    iterator += 1;
    if (pages.length >= limit) break;
  } while (Object.keys(continueParams).length > 0 && iterator < 100);
  console.log(`Finished in ${iterator} steps`);
  // Automatically get missing thumbnails
  const pagesWithThumbnails = await getThumbnails(pages.slice(0, limit));
  return pagesWithThumbnails;
}

export async function GET(req, {}) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const limit = searchParams.get("limit") || 1;

    const pages = await fetchPages(title, limit);
    const nodes = pages.map(normalizePageToNode);

    return NextResponse.json({ nodes });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: `${err}`,
      },
      { status: 500 },
    );
  }
}
