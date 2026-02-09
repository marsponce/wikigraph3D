import { NextResponse } from "next/server";
import { TFA_API_BASE } from "@/lib/constants";
import { normalizePageToNode } from "@/lib/utils";
import { responseCache as todayCache } from "@/lib/cache";
import { GraphNode } from "@/types/wikipedia";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const url = `${TFA_API_BASE}/en/featured/${year}/${month}/${day}`;

    // 1. check todayCache first
    let node;
    if (todayCache.has(url)) {
      node = todayCache.get(url) as GraphNode;
      console.log(url, "cache hit", "expiresIn:", todayCache.expiresIn(url));
      return NextResponse.json({ node });
    }

    // 2. check supabase second
    const todayStart = `${year}-${month}-${day}T00:00:00`;
    const { data: nodes } = await supabase
      .from("nodes")
      .select("*")
      .gte("created_at", todayStart)
      .order("created_at", { ascending: true })
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
        "User-Agent": `${process.env.APP_NAME} (${process.env.CONTACT})`,
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
    const { data: insertedNode, error: insertError } = await supabase
      .from("nodes")
      .insert(node)
      .select()
      .single();

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
