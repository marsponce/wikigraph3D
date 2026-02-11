// src/lib/graph/download.ts
import { RefObject } from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";
import type { GraphData, GraphNode, GraphLink } from "@/types/wikipedia";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { todaysDate } from "@/lib/utils";

export function downloadGraphModel(
  graphRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>,
) {
  if (!graphRef.current) {
    console.error("Graph Reference is not available");
    return;
  }

  const scene = graphRef.current.scene();
  if (!scene) {
    console.error("Scene is not available");
    return;
  }

  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (result) => {
      const downloadBlob = new Blob([result as ArrayBuffer], {
        type: "model/gltf-binary",
      });
      const downloadURL = URL.createObjectURL(downloadBlob);
      const filename = "wikigraph3D-" + todaysDate() + ".glb";
      const a = document.createElement("a");
      a.href = downloadURL;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(downloadURL);
    },
    (error) => {
      console.error("Failed exporting glb file:", error);
    },
    { binary: true },
  );
}

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
  const filename = "wikigraph3D-" + todaysDate() + ".json";

  const downloadURL = URL.createObjectURL(downloadBlob);

  const a = document.createElement("a");
  a.href = downloadURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(downloadURL);
}
