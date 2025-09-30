// src/app/components/Main.tsx
"use client";
import Graph from "./DynamicGraph3DBatched";
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function Main() {
  const [selectedNode, setSelectedNode] = useState(null);
  return (
    <div className="relative">
      <Graph onNodeSelect={setSelectedNode} className="" />
      <Sidebar
        node={selectedNode}
        className="absolute top-0 right-0 w-80  bg-transparent shadow-lg z-50 overflow-y-auto overflow-x-hidden"
      />
    </div>
  );
}
