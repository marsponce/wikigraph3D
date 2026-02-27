// src/app/components/sections/Main.tsx
"use client";
import { Sidebar } from "../ui";
import { useState, useRef, useEffect } from "react";
import { GraphData, GraphNode, GraphLink } from "@/types";
import Graph from "@/components/ui/Graph";
import type { GraphSettings } from "@/components/ui/Graph";
import type { ForceGraphMethods } from "react-force-graph-3d";
import { Toaster } from "sonner";
import type { GraphStats } from "@/lib/graph";
import { useGraphRealtime } from "@/lib/graph";
import { todaysDate } from "@/lib/utils";
import { driver } from "driver.js";

export default function Main() {
  // State for the app

  // graph State
  // What node is the user "looking at"
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  // the graph itself
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  } as GraphData);
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(
    undefined,
  );
  // for node expansion, wait for <this node> when we expand the graph
  const pendingNodeId = useRef<number | null>(null);

  // sync the graph to the database
  const date = todaysDate();
  useGraphRealtime(date, setGraphData, setSelectedNode, pendingNodeId);

  // Graph settings
  const defaults = {
    nodeSize: 1,
    enableDynamicNodeSizing: true,
    nodeOpacity: 1,
    linkWidth: 1,
    linkOpacity: 1,
    showLabels: true,
    showThumbnails: true,
    cooldownTicks: 100,
    enableNodeDrag: false,
    showNavInfo: true,
    dagMode: null,
    dagLevelDistance: 10,
    edgeColorMode: "depth",
    highlightDistance: 4,
  } as GraphSettings;

  // Store graph settings in localStorage so they persist.
  const [graphSettings, setGraphSettings] = useState<GraphSettings>(() => {
    if (typeof window === "undefined" || !localStorage) return defaults;
    try {
      const stored = localStorage.getItem("graphSettings");
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch (error) {
      console.error("Failed to read graphSettings from localStorage:", error);
      return defaults;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("graphSettings", JSON.stringify(graphSettings));
    } catch (error) {
      console.error("Failed to save graphSettings to localStorage:", error);
    }
  }, [graphSettings]);

  // Graph Stats
  const [stats, setStats] = useState<GraphStats | null>(null);
  useEffect(() => {
    // reset when graph changes
    setStats(null);
  }, [setStats, graphData.nodes, graphData.links]);

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
        stats={stats}
        setStats={setStats}
        pendingNodeId={pendingNodeId}
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
