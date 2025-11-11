import { NextResponse } from "next/server";
import { normalizePageToNode } from "@/lib/utils";
import { responseCache as linkCache } from "@/lib/cache";
import { GraphNode } from "@/types/wikipedia";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const url = `https://api.wikimedia.org/core/v1/wikipedia/en/search/page?q=${title}&limit=1`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.WIKIMEDIA_ACCESS_TOKEN}`,
        "User-Agent": `${process.env.APP_NAME} (${process.env.CONTACT})`,
      },
    });
    const data = await res.json();
    console.log(data);
    if (!res.ok) {
      console.error("!res.ok");
      return NextResponse.json(
        { error: "Error searching for article" },
        { status: 500 },
      );
    }
    const node = normalizePageToNode(data.pages[0]);
    return NextResponse.json({
      node: node,
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
