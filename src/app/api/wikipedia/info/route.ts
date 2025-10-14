// src/app/api/wikipedia/links/route.ts

import { NextResponse } from "next/server";
import { normalizePageToNode } from "@/lib/utils";
import { WIKI_INFO_BASE } from "@/lib/constants";

async function fetchInfo(title: string) {
  const url = new URL(`${WIKI_INFO_BASE}/page/html/${title}`);

  try {
    const res = await fetch(url.toString());
    const html = await res.text();
    return html;
  } catch (err) {
    console.error("Error fetching info:", err);
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
    const html = await fetchInfo(title);

    return NextResponse.json({ html });
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
