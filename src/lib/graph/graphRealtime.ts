// src/lib/graph/graphRealtime.ts
import { useEffect, useRef, Dispatch, SetStateAction, RefObject } from "react";
import { createClient } from "@/lib/supabase/client";
import { GraphData, GraphNode, GraphLink } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveID } from "@/lib/graph";

export function mergeGraphRealtime(
  prev: GraphData,
  newLink: GraphLink,
  fetchedNodes: GraphNode[],
): GraphData {
  const nodesMap = new Map<string | number, GraphNode>(
    prev.nodes.map((n) => [n.id!, n]),
  );

  fetchedNodes.forEach((n) => {
    if (n.id != null && !nodesMap.has(n.id)) {
      nodesMap.set(n.id, n);
    }
  });

  const resolveEndpoint = (
    endpoint: GraphLink["source"],
  ): GraphNode | number | string | undefined => {
    if (endpoint == null) return endpoint;
    if (typeof endpoint === "object") return endpoint; // already resolved
    return nodesMap.get(endpoint) ?? endpoint;
  };

  const resolvedLink: GraphLink = {
    ...newLink,
    source: resolveEndpoint(newLink.source),
    target: resolveEndpoint(newLink.target),
  };

  const isDuplicate = prev.links.some(
    (l) =>
      resolveID(l.source) === resolveID(newLink.source) &&
      resolveID(l.target) === resolveID(newLink.target),
  );

  return {
    nodes: Array.from(nodesMap.values()),
    links: isDuplicate ? prev.links : [...prev.links, resolvedLink],
  };
}

export function useGraphRealtime(
  todaysDate: string,
  setGraphData: Dispatch<SetStateAction<GraphData>>,
  setSelectedNode: Dispatch<SetStateAction<GraphNode | null>>,
  pendingNodeId: RefObject<number | null>,
): void {
  const supabase = useRef<SupabaseClient>(createClient());
  useEffect(() => {
    const client = supabase.current;

    const channel = client
      .channel(`graph-${todaysDate}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "links",
          filter: `graph_date=eq.${todaysDate}`,
        },
        async (payload) => {
          const newLink = payload.new as GraphLink;

          const { data: fetchedNodes, error } = await client
            .from("nodes")
            .select("*")
            .in("id", [newLink.source, newLink.target]);

          if (error) {
            console.error("useGraphRealtime: failed to fetch nodes", error);
            return;
          }

          setGraphData((prev) =>
            mergeGraphRealtime(prev, newLink, fetchedNodes as GraphNode[]),
          );

          // if this INSERT matches a pending clientside expansion, select the new node
          // (this is for when the client expands their graph)
          const newNode = (fetchedNodes as GraphNode[]).find(
            (n) => resolveID(n) === pendingNodeId.current,
          );
          if (newNode) {
            setSelectedNode(newNode);
            pendingNodeId.current = null;
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "links",
          filter: `graph_date=eq.${todaysDate}`,
        },
        (payload) => {
          const deletedLink = payload.old as Pick<GraphLink, "id">;
          setGraphData((prev) => ({
            ...prev,
            links: prev.links.filter((l) => l.id !== deletedLink.id),
          }));
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [todaysDate, setGraphData, setSelectedNode, pendingNodeId]);
}
