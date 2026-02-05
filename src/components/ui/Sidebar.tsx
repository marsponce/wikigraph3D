// src/app/components/ui/Sidebar.tsx
import { useState, RefObject, Dispatch, SetStateAction } from "react";
import { Button, Searchbar, ArticleCard, BreadCrumbs } from "@/components/ui";
import clsx from "clsx";
import type { GraphData, GraphNode, GraphLink } from "@/types";
import { ForceGraphMethods } from "react-force-graph-3d";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ViewfinderCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

type SidebarProps = {
  graphRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>;
  className?: string;
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  graphData: GraphData;
  setGraphData: Dispatch<SetStateAction<GraphData>>;
  isFocused: boolean;
  setIsFocused: (isFocused: boolean) => void;
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
}: SidebarProps) {
  const [sidebarState, setSidebarState] = useState<string>("closed");

  const toggleSidebar = () => {
    switch (sidebarState) {
      case "closed":
        setSidebarState("open");
        break;
      default:
        setSidebarState("closed");
        break;
    }
  };
  const toggleFullscreen = () => {
    switch (sidebarState) {
      case "fullscreen":
        setSidebarState("open");
        break;
      default: // open or closed;
        setSidebarState("fullscreen");
        break;
    }
  };

  const focusCamera = () => {
    setIsFocused(!isFocused);
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
          "transition-all duration-500",
          "w-screen",
          // State-specific styles
          {
            "bg-white/10 [transform:translateX(calc(100%-4rem))]":
              sidebarState === "closed",
            "sm:bg-black/60": sidebarState === "open",
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
          <Button
            onClick={toggleSidebar}
            toggled={sidebarState === "open" || sidebarState === "fullscreen"}
            aria-label={
              sidebarState === "closed" ? "Open Sidebar" : "Close Sidebar"
            }
          >
            <InformationCircleIcon />
          </Button>
          {/* focus button */}
          <Button
            onClick={focusCamera}
            toggled={isFocused}
            aria-label={"Center Camera"}
          >
            <ViewfinderCircleIcon />
          </Button>
        </div>
        <div
          // Sidebar container
          className={clsx(
            "flex flex-col p-[1em]",
            "h-full w-full",
            "overflow-hidden",
            {
              "": sidebarState === "closed",
              "": sidebarState === "open",
            },
          )}
          data-sidebar-state={sidebarState}
        >
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
        </div>
      </aside>
    </>
  );
}
