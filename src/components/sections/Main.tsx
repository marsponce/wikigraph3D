// src/app/components/sections/Main.tsx
"use client";
import Graph from "./Graph";
import Sidebar from "../ui/Sidebar";
import Searchbar from "../ui/Searchbar";
import { useState } from "react";
import { GraphData } from "@/lib/types";

export default function Main() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  return (
    <div className="relative">
      <Graph
        onNodeSelect={setSelectedNode}
        data={graphData}
        setData={setGraphData}
        className=""
      />
      <Sidebar node={selectedNode} graphData={graphData} className="z-2" />
    </div>
  );
}
