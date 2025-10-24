// src/app/components/sections/Main.tsx
"use client";
import { Sidebar } from "../ui";
import Graph from "../ui/Graph";
import { useState, useRef } from "react";
import { GraphData, GraphNode } from "@/types";
import type { ForceGraphMethods } from "react-force-graph-3d";

export default function Main() {
  // State for the app
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  } as GraphData);
  const graphRef = useRef<ForceGraphMethods | null>(null);

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
        graphRef={graphRef}
        selectedNode={selectedNode}
        setSelectedNodeAction={setSelectedNode}
        data={graphData}
        setDataAction={setGraphData}
        className=""
      />
      <noscript>
        <div className="my-auto ring-3 rounded p-2">
          <h1>JavaScript is disabled</h1>
          <p>Please enable JavaScript</p>
        </div>
      </noscript>
    </div>
  );
}
