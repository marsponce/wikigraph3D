// src/app/components/Main.tsx
"use client";
import Graph from "./Graph";
import Sidebar from "./Sidebar";
import Searchbar from "./Searchbar";
import { useState } from "react";

export default function Main() {
  const [selectedNode, setSelectedNode] = useState(null);
  return (
    <div className="relative">
      <Graph onNodeSelect={setSelectedNode} className="" />
      <Searchbar />
      <Sidebar node={selectedNode} className="z-2" />
    </div>
  );
}
