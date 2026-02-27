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
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import type { GraphSettings } from "@/components/ui/Graph";
import { getRootNode, focusCameraOnNode } from "@/lib/graph";
import { todaysDate } from "@/lib/utils";
import type { GraphStats } from "@/lib/graph";
import { useTutorial } from "@/lib/graph";

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
  stats: GraphStats | null;
  setStats: (stats: GraphStats | null) => void;
  pendingNodeId: RefObject<number | null>;
  startTutorial: () => void;
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
  stats,
  setStats,
  pendingNodeId,
  startTutorial,
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
      console.debug("Key pressed:", event.key);
      // Ignore shortcuts if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
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
        case "g":
          graphRef.current?.zoomToFit(1000);
          setIsFocused(false);
          break;
        case "f":
          if (selectedNode) {
            focusCameraOnNode(graphRef, selectedNode, graphData);
            setIsFocused(true);
          }
          break;
        case "Escape":
          if (sidebarState !== "closed") setSidebarState("closed");
          else setSelectedNode(null);
          break;
      }
    },
    [
      selectRootNode,
      setSelectedNode,
      sidebarState,
      graphRef,
      graphData,
      selectedNode,
      setIsFocused,
    ],
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
          "max-w-screen",
          // State-specific styles
          {
            "w-screen": sidebarMode === "fullscreen",
            "w-screen sm:w-1/3": sidebarMode === "one-third",
          },
          {
            "bg-white/10 dark:bg-white/10 [transform:translateX(calc(100%-4rem))]":
              sidebarState === "closed",
            "sm:bg-white/60 dark:sm:bg-black/60": sidebarState !== "closed",
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
            aria-label={"Statistics"}
            title={"Statistics (Z)"}
          >
            <ChartBarIcon />
          </Button>
          {/* download button */}
          <Button
            onClick={() => setSidebarState("downloads")}
            toggled={sidebarState === "downloads"}
            aria-label={"Download"}
            title={"Download (D)"}
          >
            <ArrowDownTrayIcon />
          </Button>
          <Button
            onClick={() => setSidebarState("settings")}
            toggled={sidebarState === "settings"}
            aria-label={"Settings"}
            title={"Settings (S)"}
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
            aria-label={"Focus camera on Graph"}
            title={"Focus camera on Graph (G)"}
          >
            <ArrowsPointingOutIcon />
          </Button>
          {/* tutorial */}
          <Button
            onClick={() => startTutorial()}
            aria-label={"Replay the tutorial"}
            title={"Replay the tutorial (T)"}
          >
            <QuestionMarkCircleIcon />
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
                graphData={graphData}
                setGraphData={setGraphData}
                pendingNodeId={pendingNodeId}
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
              <StatsCard
                graphRef={graphRef}
                graphData={graphData}
                setSelectedNode={setSelectedNode}
                setIsFocused={setIsFocused}
                stats={stats}
                setStats={setStats}
              />
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
