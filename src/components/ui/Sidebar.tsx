// src/app/components/ui/Sidebar.tsx
import { useState, RefObject, Dispatch, SetStateAction } from "react";
import { Button, Searchbar, ArticleCard, BreadCrumb } from "@/components/ui";
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
        className={clsx("sidebar", className ?? "")}
        data-sidebar-state={sidebarState}
      >
        {/* sidebar button */}
        <div className="button-container">
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
        <div className="sidebar-panel" data-sidebar-state={sidebarState}>
          <BreadCrumb
            graphData={graphData}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
          />
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
        </div>
      </aside>
    </>
  );
}
