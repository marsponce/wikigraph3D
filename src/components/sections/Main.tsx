// src/app/components/sections/Main.tsx
"use client";
import Graph from "./Graph";
import Sidebar from "../ui/Sidebar";
import Searchbar from "../ui/Searchbar";
import { useState } from "react";

export default function Main() {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="relative">
      <Graph onNodeSelect={setSelectedNode} className="" />
      <Sidebar node={selectedNode} className="z-2" />
    </div>
  );
}
