// src/lib/graph/download.ts
import { GraphData } from "@/types/wikipedia";

// Prepare the graph for download as JSON
export function downloadGraphJSON(graphData: GraphData) {
  const cleanNodes = graphData.nodes.map((node) => ({
    id: node.id,
    name: node.name,
    created_at: node.created_at,
    thumbnail: node.thumbnail,
    content: node.content,
    featured_date: node.featured_date,
  }));

  // Clean links - keep only database properties
  const cleanLinks = graphData.links.map((link) => ({
    id: link.id,
    source: typeof link.source === "object" ? link.source.id : link.source,
    target: typeof link.target === "object" ? link.target.id : link.target,
    created_at: link.created_at,
    graph_date: link.graph_date,
  }));

  const nodesCount = cleanNodes.length;
  const linksCount = cleanLinks.length;

  const graph = {
    graph: {
      nodes: cleanNodes,
      links: cleanLinks,
    },
    nodesCount,
    linksCount,
  };

  const downloadString = JSON.stringify(graph, null, 2);
  const downloadBlob = new Blob([downloadString], { type: "application/json" });
  const filename = "graph.json";

  const downloadURL = URL.createObjectURL(downloadBlob);

  const a = document.createElement("a");
  a.href = downloadURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(downloadURL);
}
