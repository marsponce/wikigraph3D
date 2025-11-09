// src/app/api/wikipedia/links/route.ts

import { NextResponse } from "next/server";
import { WIKI_INFO_BASE } from "@/lib/constants";
import { responseCache as articleCache } from "@/lib/cache";
import { slimArticle } from "@/lib/article";

async function fetchArticle(title: string) {
  const url = new URL(`${WIKI_INFO_BASE}/page/html/${title}`);

  try {
    const res = await fetch(url.toString());
    const html = await res.text();
    return html;
  } catch (err) {
    console.error("Error fetching article:", err);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    if (!title) {
      return NextResponse.json(
        { error: "Missing title Parameter" },
        { status: 400 },
      );
    }
    // check articleCache first
    let html;
    if (articleCache.has(title)) {
      html = articleCache.get(title);
      console.log(title, "hit", "expiresIn:", articleCache.expiresIn(title));
    } else {
      html = await fetchArticle(title);
      html = slimArticle(html);
      if (html) {
        articleCache.set(title, html as string);
        console.log(title, "miss");
      }
    }

    return NextResponse.json({ html });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      return NextResponse.json(
        {
          error: "Internal Server Error",
          code: (err.cause as { code?: string })?.code ?? "UNKNOWN_ERROR_CODE",
        },
        { status: 500 },
      );
    }
  }
}
