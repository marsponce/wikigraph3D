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
          "backdrop-blur-sm sm:backdrop-blur-md md:backdrop-blur-lg lg:backdrop-blur-xl",
          "fixed right-0 z-3",
          "flex flex-col sm:flex-row",
          "w-screen sm:h-screen",
          "transition-transform duration-500",
          // State-specific styles
          {
            "bg-white/10 h-16 sm:h-full sm:w-13": sidebarState === "closed",
            "rounded-none w-screen bg-black/30": sidebarState === "fullscreen",
            "sm:bg-white/10 h-auto sm:w-1/3": sidebarState === "open",
          },
        )}
        data-sidebar-state={sidebarState}
      >
        {/* sidebar button */}
        <div
          className={clsx(
            "flex flex-row sm:flex-col",
            "place-content-center place-items-center",
            "space-x-2 sm:space-y-2 sm:space-x-0",
            "w-fit p-3",
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
          {/* full screen button */}
          <Button
            onClick={toggleFullscreen}
            className="hidden sm:block" // show only on non-mobile screens
            toggled={sidebarState === "fullscreen"}
            aria-label={
              sidebarState === "fullscreen"
                ? "Minimize Sidebar"
                : "Maximize Sidebar"
            }
          >
            {sidebarState === "fullscreen" ? (
              <ArrowsPointingInIcon />
            ) : (
              <ArrowsPointingOutIcon />
            )}
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
            // Base Styles
            "overflow-y-auto overflow-x-hidden",
            "p-3",
            "relative",
          )}
          data-sidebar-state={sidebarState}
        >
          <Searchbar
            graphData={graphData}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            data-sidebar-state={sidebarState}
          />
          <BreadCrumbs
            graphData={graphData}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
          />
          <ArticleCard
            name={selectedNode ? selectedNode.name : undefined}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            setGraphData={setGraphData}
            sidebarState={sidebarState}
          />
        </div>
      </aside>
    </>
  );
}
