import { NextResponse } from "next/server";
import { normalizePageToNode } from "@/lib/utils";
import { responseCache as linkCache } from "@/lib/cache";
import { GraphNode, Page } from "@/types/wikipedia";
import { WIKI_API_BASE } from "@/lib/constants";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const sourceID = searchParams.get("sourceID");

    if (!title) {
      return NextResponse.json(
        { error: "Missing title parameter" },
        { status: 400 },
      );
    }
    if (!sourceID) {
      return NextResponse.json(
        { error: "Missing sourceID parameter" },
        { status: 400 },
      );
    }

    // 1. Check linkCache first
    let node;
    if (linkCache.has(req.url)) {
      node = linkCache.get(req.url) as GraphNode;
      console.log(req.url, "hit", "expiresIn:", linkCache.expiresIn(req.url));
      return NextResponse.json({ node });
    }

    const supabase = await createServerClient();

    // 2. check supabase second
    const { data: nodes } = await supabase
      .from("nodes")
      .select("*")
      .eq("name", title)
      .limit(1);

    if (nodes && nodes.length > 0) {
      node = nodes[0];
      // 2.1 link this node to the other one!
      const { error: linkInsertError } = await supabase.from("links").insert({
        source: parseInt(sourceID),
        target: node.id,
      });

      if (linkInsertError) {
        console.error("Failed to insert link:", linkInsertError);
      } else {
        console.log("Inserted link into database:", sourceID, "->", node.id);
      }

      linkCache.set(req.url, node);
      console.log(req.url, "database hit, inserted new link");
    }

    // 3. Fetch from wikipedia
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
    node = normalizePageToNode(pages[0]);

    console.log(node);

    // 4. Insert into supabase
    const { error: insertError } = await supabase.from("nodes").insert(node);

    if (insertError) {
      console.error("Failed to insert node:", insertError);
    } else {
      console.log("Inserted node into database");
    }

    // 5. Insert edge into supabase
    const { error: insertLinkError } = await supabase.from("links").insert({
      source: parseInt(sourceID),
      target: node.id,
    });

    if (insertLinkError) {
      console.error("Failed to insert link:", insertLinkError);
    } else {
      console.log("Inserted link into database:", sourceID, "->", node.id);
    }

    linkCache.set(req.url, node);
    console.log(req.url, "miss");

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
