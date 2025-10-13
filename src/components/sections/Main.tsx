// src/app/components/sections/Main.tsx
"use client";
import { Sidebar, Searchbar } from "../ui";
import Graph, { GraphHandle } from "../ui/Graph";
import { useState, useRef } from "react";
import { GraphData } from "@/lib/types";

export default function Main() {
  // State for the app
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const graphRef = useRef<GraphHandle>(null);

  return (
    <div className="relative">
      <Sidebar
        graphRef={graphRef}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        graphData={graphData}
        className=""
      />
      <Graph
        ref={graphRef}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        data={graphData}
        setData={setGraphData}
        className=""
      />
    </div>
  );
}
