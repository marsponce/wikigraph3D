// src/app/components/sections/Main.tsx
"use client";
import { Sidebar } from "../ui";
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
      <noscript>
        <div className="my-auto ring-3 rounded p-2">
          <h1>JavaScript is disabled</h1>
          <p>Please enable JavaScript</p>
        </div>
      </noscript>
    </div>
  );
}
