// src/app/api/wikipedia/today/route.ts
import { NextResponse } from "next/server";
import { TFA_API_BASE } from "@/lib/constants";
import { normalizePageToNode } from "@/lib/utils";
import { responseCache as todayCache } from "@/lib/cache";
import { GraphNode } from "@/types/wikipedia";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const supabase = await createServerClient();
    if (!date) {
      console.error("Failed to provide date parameter");
      return NextResponse.json({ error: "No date provided", code: 400 });
    }
    const [year, month, day] = date.split("-");
    const url = `${TFA_API_BASE}/en/featured/${year}/${month}/${day}`;

    // 1. check todayCache first
    let node;
    if (todayCache.has(url)) {
      node = todayCache.get(url) as GraphNode;
      console.log(url, "cache hit", "expiresIn:", todayCache.expiresIn(url));
      return NextResponse.json({ node });
    }

    // 2. check supabase second
    const { data: nodes } = await supabase
      .from("nodes")
      .select("*")
      .eq("featured_date", date)
      .limit(1);

    if (nodes && nodes.length > 0) {
      node = nodes[0];
      todayCache.set(url, node);
      console.log(url, "database hit");
      return NextResponse.json({ node });
    }

    // 3. Fetch from wikipedia
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.WIKIMEDIA_ACCESS_TOKEN}`,
        "User-Agent": `${process.env.NEXT_PUBLIC_APP_NAME} (${process.env.NEXT_PUBLIC_CONTACT})`,
      },
    });

    if (!res.ok) {
      console.error("error: !res.ok");
      return NextResponse.json(
        { error: "Error fetching article" },
        { status: 500 },
      );
    }
    const data = await res.json();
    data.tfa.title = data.tfa.titles.normalized;
    node = normalizePageToNode(data.tfa);
    node.content = data.tfa?.content_urls; // Since normalizePageToNode doesn't work 100% with this type of response

    // 4. Store in supabase
    const { error: insertError } = await supabase
      .from("nodes")
      .insert({ ...node, featured_date: date });

    if (insertError) {
      console.error("Failed to insert root:", insertError);
    } else {
      console.log("Inserted root node into database");
    }

    todayCache.set(url, node);
    console.log(url, "miss");

    return NextResponse.json({ node });
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
