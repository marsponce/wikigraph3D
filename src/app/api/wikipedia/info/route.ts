// src/app/api/wikipedia/links/route.ts

import { NextResponse } from "next/server";
import { WIKI_INFO_BASE } from "@/lib/constants";
import { responseCache as infoCache } from "@/lib/cache";

async function fetchInfo(title: string) {
  const url = new URL(`${WIKI_INFO_BASE}/page/html/${title}`);

  try {
    const res = await fetch(url.toString());
    const html = await res.text();
    return html;
  } catch (err) {
    console.error("Error fetching info:", err);
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
    // check infoCache first
    let html;
    if (infoCache.has(title)) {
      html = infoCache.get(title);
      console.log(title, "hit", "expiresIn:", infoCache.expiresIn(title));
    } else {
      html = await fetchInfo(title);
      if (html) {
        infoCache.set(title, html as string);
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
