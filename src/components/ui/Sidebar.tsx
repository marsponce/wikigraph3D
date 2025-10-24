// src/app/components/ui/Sidebar.tsx
import parse from "html-react-parser";
import he from "he";
import { useState, RefObject } from "react";
import { Transition } from "@headlessui/react";
import { Button, Searchbar } from "@/components/ui";
import clsx from "clsx";
import { GraphData, GraphNode, GraphLink } from "@/types";
import { ForceGraphMethods } from "react-force-graph-3d";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowLeftEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";

type SidebarProps = {
  graphRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>;
  className?: string;
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  graphData: GraphData;
  isFocused: boolean;
  setIsFocused: (isFocused: boolean) => void;
};

export default function Sidebar({
  graphRef,
  className,
  selectedNode,
  setSelectedNode,
  graphData,
  isFocused,
  setIsFocused,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setFullscreen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleFullscreen = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
    setFullscreen(!isFullscreen);
  };

  const focusCamera = () => {
    if (graphRef.current) {
      console.log("focusCamera");
      // graphRef.current.focusCamera();
    }
    setIsFocused(!isFocused);
  };

  return (
    <>
      <aside className={clsx("sidebar", className ?? "")}>
        {/* sidebar button */}
        <div className="button-container">
          <Button
            onClick={toggleSidebar}
            toggled={isOpen}
            aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {isOpen ? (
              <ArrowRightStartOnRectangleIcon />
            ) : (
              <ArrowLeftEndOnRectangleIcon />
            )}
          </Button>
          <Button
            onClick={toggleFullscreen}
            toggled={isFullscreen}
            aria-label={isFullscreen ? "Minimize Sidebar" : "Maximize Sidebar"}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon />
            ) : (
              <ArrowsPointingOutIcon />
            )}
          </Button>
          {/* full screen button */}
          <Button
            onClick={focusCamera}
            toggled={isFocused}
            aria-label={"Center Camera"}
          >
            <ViewfinderCircleIcon />
          </Button>
        </div>
        <Transition show={isOpen}>
          <div
            className={clsx(
              "sidebar-panel",
              /* TODO: Animate the sidebar
              "transition duration-600",
              "data-closed:translate-x-full",
              "data-enter:data-closed:translate-x-full",*/
              isFullscreen ? "w-full h-full" : "",
            )}
          >
            {/* searchbar */}
            <Searchbar
              graphData={graphData}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
            />
            <div className="sidebar-content prose">
              {selectedNode ? (
                <>
                  {selectedNode.description && (
                    <div>
                      <h2>Description</h2>
                      {parse(he.decode(selectedNode.description))}
                    </div>
                  )}
                  {selectedNode.extract && (
                    <div>
                      <h2>Extract</h2>
                      {parse(he.decode(selectedNode.extract))}
                    </div>
                  )}
                </>
              ) : (
                <p>No node selected</p>
              )}
            </div>
          </div>
        </Transition>
      </aside>
    </>
  );
}
