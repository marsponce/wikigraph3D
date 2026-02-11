// src/app/components/ui/Sidebar.tsx
import { useState, RefObject, Dispatch, SetStateAction } from "react";
import {
  Button,
  Searchbar,
  ArticleCard,
  BreadCrumbs,
  DownloadCard,
} from "@/components/ui";
import clsx from "clsx";
import type { GraphData, GraphNode, GraphLink } from "@/types";
import type { ForceGraphMethods } from "react-force-graph-3d";
import {
  ViewfinderCircleIcon,
  DocumentTextIcon,
  CubeIcon,
  HomeIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { downloadGraphJSON, downloadGraphModel } from "@/lib/graph";

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
        setSidebarState("article");
        break;
      case "downloads":
        setSidebarState("article");
        break;
      default:
        setSidebarState("closed");
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
          {/* download button */}
          <Button
            onClick={() => setSidebarState("downloads")}
            toggled={sidebarState === "downloads"}
            aria-label={"Download today's graph"}
          >
            <ArrowDownTrayIcon />
          </Button>
          {/* camera/control buttons */}
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
          {sidebarState === "settings" && <></>}
        </div>
      </aside>
    </>
  );
}
