// src/app/components/ui/Sidebar.tsx
import { useState, RefObject, Dispatch, SetStateAction } from "react";
import {
  Button,
  Searchbar,
  ArticleCard,
  BreadCrumbs,
  DownloadCard,
  SettingsCard,
  StatsCard,
} from "@/components/ui";
import clsx from "clsx";
import type { GraphData, GraphNode, GraphLink } from "@/types";
import type { ForceGraphMethods } from "react-force-graph-3d";
import {
  DocumentTextIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  CogIcon,
  XMarkIcon,
  FunnelIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";
import type { GraphSettings } from "@/components/ui/Graph";
import { getRootNode } from "@/lib/graph";
import { todaysDate } from "@/lib/utils";

type SidebarProps = {
  graphRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>;
  className?: string;
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  graphData: GraphData;
  setGraphData: Dispatch<SetStateAction<GraphData>>;
  isFocused: boolean;
  setIsFocused: (isFocused: boolean) => void;
  graphSettings: GraphSettings;
  setGraphSettings: (graphSettings: GraphSettings) => void;
};

export default function Sidebar({
  graphRef,
  className,
  selectedNode,
  setSelectedNode,
  graphData,
  setGraphData,
  isFocused,
  setIsFocused,
  graphSettings,
  setGraphSettings,
}: SidebarProps) {
  const [sidebarState, setSidebarState] = useState<string>("closed");

  const toggleSidebar = () => {
    switch (sidebarState) {
      case "closed":
        setSidebarState("article");
        break;
      case "downloads":
        setSidebarState("article");
        break;
      case "settings":
        setSidebarState("article");
        break;
      case "stats":
        setSidebarState("article");
        break;
      default:
        setSidebarState("closed");
        break;
    }
  };

  return (
    <>
      <aside
        className={clsx(
          // Base styles
          "backdrop-blur-lg",
          "fixed right-0 top-0 z-3",
          "flex flex-row",
          "h-screen",
          "duration-500",
          "transition",
          "w-screen",
          // State-specific styles
          {
            "bg-white/10 [transform:translateX(calc(100%-4rem))]":
              sidebarState === "closed",
            "sm:bg-black/60": sidebarState !== "closed",
          },
        )}
        data-sidebar-state={sidebarState}
      >
        {/* sidebar buttons */}
        <div
          className={clsx(
            "flex flex-col",
            "place-content-center place-items-center",
            "space-y-2",
            "w-[4rem] p-3",
          )}
        >
          {/* Buttons that change the content rendered in the sidebar */}
          <Button
            onClick={toggleSidebar}
            toggled={sidebarState !== "closed"}
            aria-label={
              sidebarState === "closed" ? "Open Sidebar" : "Close Sidebar"
            }
          >
            {sidebarState === "closed" ? <DocumentTextIcon /> : <XMarkIcon />}
          </Button>
          {/* stats button */}
          <Button
            onClick={() => setSidebarState("stats")}
            toggled={sidebarState === "stats"}
            aria-label={"See graph statistics"}
          >
            <ChartBarIcon />
          </Button>
          {/* download button */}
          <Button
            onClick={() => setSidebarState("downloads")}
            toggled={sidebarState === "downloads"}
            aria-label={"Download today's graph"}
          >
            <ArrowDownTrayIcon />
          </Button>
          <Button
            onClick={() => setSidebarState("settings")}
            toggled={sidebarState === "settings"}
            aria-label={"Change graph visualization settings"}
          >
            <CogIcon />
          </Button>
          {/* go to root node */}
          <Button
            onClick={() => {
              const root = getRootNode(graphData, todaysDate());
              console.log("Found root", root);
              setSelectedNode(root);
            }}
            toggled={selectedNode === getRootNode(graphData, todaysDate())}
            aria-label={"Select root node "}
          >
            <ViewfinderCircleIcon />
          </Button>
          {/* Filter button */}
          <Button
            onClick={console.log("Filter")}
            aria-label={"Filter node settings"}
          >
            <FunnelIcon />
          </Button>
        </div>
        <div
          // Sidebar container
          className={clsx(
            "flex flex-col p-[1em]",
            "h-full w-full",
            "overflow-hidden",
          )}
          data-sidebar-state={sidebarState}
        >
          {sidebarState === "article" && (
            <>
              <Searchbar
                graphData={graphData}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                data-sidebar-state={sidebarState}
              />
              <ArticleCard
                name={selectedNode ? selectedNode.name : undefined}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                setGraphData={setGraphData}
              />
              <BreadCrumbs
                graphData={graphData}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                sidebarState={sidebarState}
              />
            </>
          )}
          {sidebarState === "downloads" && (
            <>
              <DownloadCard graphRef={graphRef} graphData={graphData} />
            </>
          )}
          {sidebarState === "stats" && (
            <>
              <StatsCard graphData={graphData} />
            </>
          )}
          {sidebarState === "settings" && (
            <>
              <SettingsCard
                graphRef={graphRef}
                graphSettings={graphSettings}
                setGraphSettings={setGraphSettings}
              />
            </>
          )}
        </div>
      </aside>
    </>
  );
}
