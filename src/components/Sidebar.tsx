// src/app/components/Sidebar.tsx
import parse from "html-react-parser";
import he from "he";
import { useState } from "react";

type SidebarProps = {
  className?: string;
  node: Node;
};

export default function Sidebar({ className, node }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setFullscreen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleFullscreen = () => setFullscreen(!isFullscreen);

  return (
    <>
      <div
        className={`
					pointer-events-none
					absolute top-0 right-0
					bg-transparent shadow-lg z-60
					overflow-x-hidden
					${isFullscreen ? "w-screen h-screen pointer-events-auto" : "w-100 min-h-full"} ${className ?? ""}
				`}
      >
        {/* sidebar button */}
        <button
          onClick={toggleSidebar}
          className={`
						pointer-events-auto
						pr-1 absolute top-2 right-2
						bg-gray-800 text-white size-7 rounded z-61
					`}
          title={isOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isOpen ? "󰞔" : "󰋽"}
        </button>
        <button
          onClick={toggleFullscreen}
          className={`
						pointer-events-auto
						absolute top-10 right-2 pr-1
						bg-gray-800 text-white size-7 rounded z-61
						transform transition-transform duration-600 ${isOpen ? "translate-x-0" : "translate-x-20"}`}
          title={isFullscreen ? "Minimize Sidebar" : "Maximize Sidebar"}
        >
          {isFullscreen ? "󰘕" : "󰘖"}
        </button>
        <div
          className={`
						p-4
						max-h-screen
						bg-black/80
						pointer-events-auto
						overflow-y-auto overflow-x-hidden
						transform transition-transform duration-600
						${isOpen ? "translate-x-0" : "translate-x-full"} ${isFullscreen ? "w-screen h-screen " : "rounded"}`}
        >
          {/* full screen button */}
          {node ? (
            <>
              <h1 className="font-bold">{node.name}</h1>
              {node.description && (
                <div className="prose text-justify">
                  <h2 className="font-bold">Description</h2>
                  {parse(he.decode(node.description))}
                </div>
              )}
              {node.extract && (
                <div className="prose text-justify">
                  <h2 className="font-bold">Extract</h2>
                  {parse(he.decode(node.extract))}
                </div>
              )}
            </>
          ) : (
            <p>No node selected</p>
          )}
        </div>
      </div>
    </>
  );
}
