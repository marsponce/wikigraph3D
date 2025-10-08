// src/app/components/ui/Sidebar.tsx
import parse from "html-react-parser";
import he from "he";
import { useState, useRef } from "react";
import { Transition, TransitionChild } from "@headlessui/react";
import { Button } from "./Button";
import Searchbar from "./Searchbar";
import clsx from "clsx";

type SidebarProps = {
  className?: string;
  node: Node;
};

export default function Sidebar({ className, node }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setFullscreen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleFullscreen = () => {
    if (!isOpen) setIsOpen(true);
    setFullscreen(!isFullscreen);
  };

  const graphData = [
    { id: 1, name: "node1" },
    { id: 2, name: "node2" },
    { id: 3, name: "node3" },
    { id: 4, name: "node4" },
  ];

  return (
    <>
      <div
        className={`
					pointer-events-none
					absolute top-0 right-0
					bg-transparent shadow-lg z-50
					overflow-x-hidden
					overflow-y-hidden
					origin-top-right
					${className ?? ""}
					h-full
					w-full
				`}
      >
        {/* sidebar button */}
        <Button
          onClick={toggleSidebar}
          toggled={isOpen}
          variant="sidebar"
          className="pr-1 absolute top-2 right-2 z-51"
          title={isOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isOpen ? "󰞔" : "󰋽"}
        </Button>
        <Transition show={isOpen}>
          <div
            className={clsx(
              "p-4 bg-black/80 pointer-events-auto",
              "absolute top-0 right-0",
              "overflow-y-auto overflow-x-hidden origin-top-right",
              "rounded h-auto min-h-20",
              "transition duration-600",
              "transition duration-600",
              "data-closed:translate-x-full",
              "data-enter:data-closed:translate-x-full",
              "data-leave:data-closed:transalte-x-0",
              isFullscreen ? "w-screen h-screen" : "w-100",
            )}
          >
            {/* searchbar */}
            <Searchbar graphData={graphData} />
            {/* full screen button */}
            <Button
              onClick={toggleFullscreen}
              toggled={isFullscreen}
              variant="sidebar"
              className={`
									absolute top-10 right-2 pr-1
								`}
              title={isFullscreen ? "Minimize Sidebar" : "Maximize Sidebar"}
            >
              {isFullscreen ? "󰘕" : "󰘖"}
            </Button>
            {node ? (
              <>
                <h1 className="font-bold pr-8">{node.name}</h1>
                {node.description && (
                  <div className="prose text-justify">
                    <h2 className="font-bold ">Description</h2>
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
            {/*
								TODO: Finish fullscreen transition
						*/}
          </div>
        </Transition>
      </div>
    </>
  );
}
