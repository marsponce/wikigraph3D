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

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <div
        className={`pointer-events-none absolute top-0 right-0 w-80  bg-transparent shadow-lg z-50 overflow-x-hidden ${className ?? ""}`}
      >
        <button
          onClick={toggleSidebar}
          className="pointer-events-auto absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded z-60"
          title={isOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isOpen ? ">>" : "<<"}
        </button>
        <div
          className={`p-4 max-h-screen bg-black/80 overflow-y-auto overflow-x-hidden rounded transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {node ? (
            <>
              <h1 className="font-bold">{node.name}</h1>
              {node.extract && (
                <div className="pointer-events-auto prose ">
                  <h2 className="font-bold">Extract</h2>
                  {parse(he.decode(node.extract))}
                </div>
              )}
              {node.description && (
                <div className="pointer-events-auto prose">
                  <h2 className="font-bold">Description</h2>
                  {parse(he.decode(node.description))}
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
