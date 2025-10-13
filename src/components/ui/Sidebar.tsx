// src/app/components/ui/Sidebar.tsx
import parse from "html-react-parser";
import he from "he";
import { useState } from "react";
import { Transition } from "@headlessui/react";
import { Button, Searchbar } from "@/components/ui";
import clsx from "clsx";
import { GraphData } from "@/lib/types";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowLeftEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";
import { GraphHandle } from "./Graph";

type SidebarProps = {
  graphRef: refObject<GraphHandle>;
  className?: string;
  selectedNode: Node;
  setSelectedNode: (node: Node) => void;
  data: GraphData;
};

export default function Sidebar({
  graphRef,
  className,
  selectedNode,
  setSelectedNode,
  graphData,
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
  const centerCamera = () => {
    if (graphRef.current) {
      graphRef.current.resetCamera();
    }
  };

  return (
    <>
      <aside className={clsx("sidebar", className ?? "")}>
        {/* sidebar button */}
        <div className="button-container">
          <Button
            onClick={toggleSidebar}
            toggled={isOpen}
            title={isOpen ? "Close Sidebar" : "Open Sidebar"}
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
            title={isFullscreen ? "Minimize Sidebar" : "Maximize Sidebar"}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon />
            ) : (
              <ArrowsPointingOutIcon />
            )}
          </Button>
          {/* full screen button */}
          <Button onClick={centerCamera} title={"Center Camera"}>
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
              isFullscreen ? "w-full h-full" : "w-100",
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
