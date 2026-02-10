// src/app/api/wikipedia/graph/route.ts
import { NextResponse } from "next/server";
import { GraphData, GraphNode, GraphLink } from "@/types/wikipedia";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      console.error("Failed to provide date parameter");
      return NextResponse.json({ error: "No date provided", code: 400 });
    }

    const supabase = await createServerClient();

    const { data: links, error: linksError } = await supabase
      .from("links")
      .select("*")
      .eq("graph_date", date)
      .order("created_at", { ascending: true });

    // Get all unique node IDs from links
    const nodeIDs = new Set<string>();
    links?.forEach((link) => {
      nodeIDs.add(link.source);
      nodeIDs.add(link.target);
    });

    // Fetch all the nodes from this set of ids
    const { data: nodes, error: nodesError } = await supabase
      .from("nodes")
      .select("*")
      .in("id", Array.from(nodeIDs));

    if (nodesError || linksError) {
      console.error(
        "error: Failed to retrieve nodes or links",
        nodesError,
        linksError,
      );
      return NextResponse.json(
        { error: "Error fetching nodes graph" },
        { status: 500 },
      );
    }
    const graph: GraphData = {
      nodes: nodes as GraphNode[],
      links: links as GraphLink[],
    };

    return NextResponse.json({
      graph,
      nodesCount: nodes?.length || 0,
      linksCount: links?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        code: `${error}`,
      },
      { status: 500 },
    );
  }
}
