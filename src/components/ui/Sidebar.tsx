// src/app/components/ui/Sidebar.tsx
import {
  useState,
  RefObject,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
} from "react";
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
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import type { GraphSettings } from "@/components/ui/Graph";
import { getRootNode, focusCameraOnNode } from "@/lib/graph";
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
  const [sidebarMode, setSidebarMode] = useState<"fullscreen" | "one-third">(
    "one-third",
  );

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

  const selectRootNode = useCallback(() => {
    setSelectedNode(getRootNode(graphData, todaysDate()));
  }, [graphData, setSelectedNode]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      console.log("Key pressed:", event.key);
      // Ignore shortcuts if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      switch (event.key) {
        case "a":
          setSidebarState("article");
          break;
        case "s":
          setSidebarState("settings");
          break;
        case "d":
          setSidebarState("downloads");
          break;
        case "z":
          setSidebarState("stats");
          break;
        case "r":
          selectRootNode();
          break;
        case "c":
          graphRef.current?.zoomToFit(1000);
          break;
        case "Escape":
          if (sidebarState !== "closed") setSidebarState("closed");
          else setSelectedNode(null);
          break;
      }
    },
    [selectRootNode, setSelectedNode, sidebarState, graphRef],
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

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
          // State-specific styles
          {
            "w-screen": sidebarMode === "fullscreen",
            "sm:w-1/3": sidebarMode === "one-third",
          },
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
            title={
              sidebarState === "closed"
                ? "Open Sidebar (A)"
                : "Close Sidebar (Esc)"
            }
          >
            {sidebarState === "closed" ? <DocumentTextIcon /> : <XMarkIcon />}
          </Button>
          {/* stats button */}
          <Button
            onClick={() => setSidebarState("stats")}
            toggled={sidebarState === "stats"}
            aria-label={"See graph statistics"}
            title={"Stats (Z)"}
          >
            <ChartBarIcon />
          </Button>
          {/* download button */}
          <Button
            onClick={() => setSidebarState("downloads")}
            toggled={sidebarState === "downloads"}
            aria-label={"Download today's graph"}
            title={"Download (D)"}
          >
            <ArrowDownTrayIcon />
          </Button>
          <Button
            onClick={() => setSidebarState("settings")}
            toggled={sidebarState === "settings"}
            aria-label={"Change graph visualization settings"}
            title={"Stats (S)"}
          >
            <CogIcon />
          </Button>
          {/* focus camera on selectedNode */}
          <Button
            onClick={() => {
              if (selectedNode) {
                focusCameraOnNode(graphRef, selectedNode, graphData);
                setIsFocused(true);
              }
            }}
            aria-label={"Focus camera on selected node"}
            title={"Focus camera on selected node (F)"}
            toggled={isFocused}
            disabled={!selectedNode}
          >
            {selectedNode ? <VideoCameraIcon /> : <VideoCameraSlashIcon />}
          </Button>
          {/* reset camera */}
          <Button
            onClick={() => {
              graphRef.current?.zoomToFit(1000);
              setIsFocused(false);
            }}
            aria-label={"Focus camera on graph"}
            title={"Focus camera on Graph (G)"}
          >
            <ArrowsPointingOutIcon />
          </Button>
          {/* Filter button */}
          <Button
            onClick={console.log("Filter")}
            aria-label={"Filter node settings"}
            title={"Filter (F)"}
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
                sidebarMode={sidebarMode}
                setSidebarMode={setSidebarMode}
              />
            </>
          )}
        </div>
      </aside>
    </>
  );
}
