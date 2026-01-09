// src/app/api/wikipedia/links/route.ts

import { NextResponse } from "next/server";
import { WIKI_API_BASE } from "@/lib/constants";
import { responseCache as articleCache } from "@/lib/cache";
import { slimArticle } from "@/lib/article";

async function fetchArticle(title: string) {
  const url = new URL(WIKI_API_BASE);
  url.searchParams.set("action", "parse");
  url.searchParams.set("page", title);
  url.searchParams.set("format", "json");
  url.searchParams.set("prop", "text");
  url.searchParams.set("formatversion", "2");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.WIKIMEDIA_ACCESS_TOKEN}`,
        "User-Agent": `${process.env.APP_NAME} (${process.env.CONTACT})`,
      },
    });
    const data = await res.json();
    let html;
    if (data.parse.text) {
      html = data.parse.text;
    } else {
      console.log(data);
      html = "<p>No data.parse.text found...</p>";
    }
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
