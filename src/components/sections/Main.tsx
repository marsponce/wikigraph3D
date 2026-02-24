// src/app/components/sections/Main.tsx
"use client";
import { Sidebar } from "../ui";
import { useState, useRef, useEffect } from "react";
import { GraphData, GraphNode, GraphLink } from "@/types";
import Graph from "@/components/ui/Graph";
import type { GraphSettings } from "@/components/ui/Graph";
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
  const [graphSettings, setGraphSettings] = useState<GraphSettings>(
    () =>
      ({
        nodeSize: 1,
        enableDynamicNodeSizing: true,
        nodeOpacity: 0.25,
        linkWidth: 1,
        linkOpacity: 1,
        showLabels: true,
        showThumbnails: true,
        cooldownTicks: 100,
        enableNodeDrag: false,
        showNavInfo: true,
        controlType: "trackball",
        edgeColorMode: "depth",
        highlightDistance: 4,
      }) as GraphSettings,
  );

  // Change the background according to os theme
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      setGraphSettings((prev) => ({ ...prev, darkMode: event.matches }));
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);
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
        graphSettings={graphSettings}
        setGraphSettings={setGraphSettings}
      />
      <Graph
        graphRef={graphRef}
        selectedNode={selectedNode}
        setSelectedNodeAction={setSelectedNode}
        data={graphData}
        setDataAction={setGraphData}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        {...graphSettings}
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
            toast:
              "!bg-gray-100 !border !border-gray-300 dark:!bg-gray-800 dark:!border-gray-700",
            icon: "!text-gray-900 dark:!text-white",
            title: "!text-gray-900 dark:!text-white",
            description: "!text-gray-600 dark:!text-gray-300",
            actionButton:
              "!p-3 !rounded !transition-colors !duration-300 !bg-gray-200 hover:!bg-sky-400 active:!bg-sky-200 !text-gray-900 dark:!bg-gray-900 dark:hover:!bg-sky-600 dark:active:!bg-sky-100 dark:!text-white",
            cancelButton:
              "!p-3 !rounded !transition-colors !duration-300 !bg-gray-300 hover:!bg-gray-400 active:!bg-gray-500 !text-gray-900 dark:!bg-gray-700 dark:hover:!bg-gray-600 dark:active:!bg-gray-500 dark:!text-white",
          },
        }}
      />
    </div>
  );
}
