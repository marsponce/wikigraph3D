// src/app/components/Main.tsx
"use client";
import Graph from "./DynamicGraph3DBatched";
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function Main() {
  const [selectedNode, setSelectedNode] = useState(null);
  return (
    <div className="">
      <Graph onNodeSelect={setSelectedNode} />
      <Sidebar node={selectedNode} />
    </div>
  );
}
