// src/app/components/sections/Main.tsx
"use client";
import { Graph, Sidebar, Searchbar } from "../ui";
import { useState } from "react";
import { GraphData } from "@/lib/types";

export default function Main() {
  // State for the app
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  return (
    <div className="relative">
      <Graph
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        data={graphData}
        setData={setGraphData}
        className=""
      />
      <Sidebar
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        graphData={graphData}
        className=""
      />
    </div>
  );
}
