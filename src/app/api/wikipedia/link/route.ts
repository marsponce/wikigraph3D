import { NextResponse } from "next/server";
import { normalizePageToNode } from "@/lib/utils";
import { responseCache as linkCache } from "@/lib/cache";
import { GraphNode, Page } from "@/types/wikipedia";
import { WIKI_API_BASE } from "@/lib/constants";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");

    if (!title) {
      return NextResponse.json(
        { error: "Missing title parameter" },
        { status: 400 },
      );
    }

    const url = new URL(WIKI_API_BASE);
    url.searchParams.set("action", "query");
    url.searchParams.set("titles", title);
    url.searchParams.set("format", "json");
    url.searchParams.set("prop", "info|description|extracts|pageimages");
    url.searchParams.set("pithumbsize", "200");
    url.searchParams.set("inprop", "url");
    url.searchParams.set("exintro", "true");
    url.searchParams.set("origin", "*");
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.WIKIMEDIA_ACCESS_TOKEN}`,
        "User-Agent": `${process.env.APP_NAME} (${process.env.CONTACT})`,
      },
    });
    if (!res.ok) {
      console.error("!res.ok");
      return NextResponse.json(
        { error: "Error searching for article" },
        { status: 500 },
      );
    }
    const data = await res.json();
    const pages: Page[] = [];
    pages.push(...(Object.values(data.query?.pages || {}) as Page[]));
    const node = normalizePageToNode(pages[0]);
    return NextResponse.json({
      node: node as GraphNode,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        code: `${err}`,
      },
      { status: 500 },
    );
  }
}
