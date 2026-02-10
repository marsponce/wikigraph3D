// src/app/api/wikipedia/graph/route.ts
import { NextResponse } from "next/server";
import { GraphData, GraphNode, GraphLink } from "@/types/wikipedia";
import { createServerClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeZone = searchParams.get("timezone") || "UTC";
    const supabase = await createServerClient();

    const today = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(today);
    const year = parts.find((p) => p.type === "year")!.value;
    const month = parts.find((p) => p.type === "month")!.value;
    const day = parts.find((p) => p.type === "day")!.value;

    const todayStart = `${year}-${month}-${day}T00:00:00Z`;
    console.log("todayStart:", todayStart);

    const { data: nodes, error: nodesError } = await supabase
      .from("nodes")
      .select("*")
      .gte("created_at", todayStart)
      .order("created_at", { ascending: true });

    const { data: links, error: linksError } = await supabase
      .from("links")
      .select("*")
      .gte("created_at", todayStart)
      .order("created_at", { ascending: true });

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
