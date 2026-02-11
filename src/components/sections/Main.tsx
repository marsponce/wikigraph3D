// src/app/components/sections/Main.tsx
"use client";
import { Sidebar } from "../ui";
import Graph from "../ui/Graph";
import { useState, useRef } from "react";
import { GraphData, GraphNode, GraphLink } from "@/types";
import type { ForceGraphMethods } from "react-force-graph-3d";
import { Toaster } from "sonner";

export default function Main() {
  // State for the app
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  } as GraphData);
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(
    undefined,
  );
  return (
    <div className="relative">
      <Sidebar
        graphRef={graphRef}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        graphData={graphData}
        setGraphData={setGraphData}
        className=""
        isFocused={isFocused}
        setIsFocused={setIsFocused}
      />
      <Graph
        graphRef={graphRef}
        selectedNode={selectedNode}
        setSelectedNodeAction={setSelectedNode}
        data={graphData}
        setDataAction={setGraphData}
        className=""
        isFocused={isFocused}
      />
      <noscript>
        <div className="my-auto ring-3 rounded p-2">
          <h1>JavaScript is disabled</h1>
          <p>Please enable JavaScript</p>
        </div>
      </noscript>
      <Toaster
        toastOptions={{
          classNames: {
            toast: "!bg-gray-800 !border !border-gray-700",
            icon: "!text-white",
            title: "!text-white",
            description: "!text-gray-300",
            actionButton:
              "!p-3 !rounded !transition-colors !duration-300 !bg-gray-900 hover:!bg-sky-600 active:!bg-sky-100 !text-white",
            cancelButton:
              "!p-3 !rounded !transition-colors !duration-300 !bg-gray-700 hover:!bg-gray-600 active:!bg-gray-500 !text-white",
          },
        }}
      />
    </div>
  );
}
