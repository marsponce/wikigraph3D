// src/app/api/wikipedia/graph/route.ts
import { NextResponse } from "next/server";
import { GraphData, GraphNode, GraphLink } from "@/types/wikipedia";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: nodes, error: nodesError } = await supabase
      .from("nodes")
      .select("*");
    const { data: links, error: linksError } = await supabase
      .from("links")
      .select("*");

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
      nodeCount: nodes?.length || 0,
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
