// src/components/ui/BreadCrumbs.tsx
import type { GraphNode, GraphData } from "@/types";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type BreadCrumbsProps = {
  className?: string;
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  graphData: GraphData;
  sidebarState: string;
};
export default function BreadCrumbs({
  className,
  selectedNode,
  setSelectedNode,
  graphData,
  sidebarState,
}: BreadCrumbsProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const isPopState = useRef<boolean>(false);
  const isBreadcrumbClick = useRef<boolean>(false);

  // Create initial history entry on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("article");
    window.history.replaceState({ breadcrumbs: [] }, "", url.toString());
  }, []);

  // Update URL and breadcrumbs whenever selectedNode changes
  useEffect(() => {
    if (isPopState.current) {
      isPopState.current = false;
      return;
    }

    const url = new URL(window.location.href);
    let newBreadcrumbs: string[];
    if (selectedNode) {
      const existingIndex = breadcrumbs.findIndex(
        (name) => name === selectedNode.name,
      );

      if (existingIndex !== -1) {
        // Node already exists, truncate to that point
        newBreadcrumbs = breadcrumbs.slice(0, existingIndex + 1);
      } else {
        // New node, append it
        newBreadcrumbs = [...breadcrumbs, selectedNode.name!];
      }

      setBreadcrumbs(newBreadcrumbs);
      url.searchParams.set("article", encodeURIComponent(selectedNode.name!));
    } else {
      newBreadcrumbs = [];
      setBreadcrumbs([]);
      url.searchParams.delete("article");
    }

    window.history.pushState(
      { breadcrumbs: newBreadcrumbs },
      "",
      url.toString(),
    );
  }, [selectedNode]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      isPopState.current = true;

      // If this was triggered by breadcrumb click, don't restore old breadcrumbs
      if (!isBreadcrumbClick.current && event.state?.breadcrumbs) {
        setBreadcrumbs(event.state.breadcrumbs);
      }
      isBreadcrumbClick.current = false; // Reset flag

      const params = new URLSearchParams(window.location.search);
      const article = params.get("article");

      if (article) {
        const articleName = decodeURIComponent(article);
        const node = graphData.nodes.find((n) => n.name === articleName);
        if (node) {
          setSelectedNode(node);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [graphData.nodes, setSelectedNode]);

  return (
    <>
      <nav
        className={clsx(
          "fixed bottom-0 right-0",
          "w-full",
          "backdrop-blur-lg",
          "p-3",
          "overflow-x-auto whitespace-nowrap",
          "[direction:rtl]",
          "transition-opacity duration-500",
          {
            "opacity-0": sidebarState === "closed",
          },
        )}
      >
        <div
          className={clsx("inline-block", "[direction:ltr]", "transition-all")}
        >
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((nodeName, index) => (
              <span key={index}>
                {index !== 0 && " → "}
                <button
                  className={clsx(
                    "inline-block",
                    "font-bold",
                    "bg-zinc-950 hover:bg-zinc-300 active:bg-zinc-100",
                    "transition-all",
                    "rounded-xl",
                    "p-1",
                    "text-xs",
                    "before:content-[''] before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-full before:w-10",
                  )}
                  onClick={() => {
                    // Don't allow clicking the current node
                    if (index === breadcrumbs.length - 1) return;

                    isBreadcrumbClick.current = true;
                    const node = graphData.nodes.find(
                      (node) => node.name === nodeName,
                    );
                    if (node) setSelectedNode(node);
                  }}
                >
                  {nodeName}
                </button>
              </span>
            ))
          ) : (
            <p />
          )}
        </div>
      </nav>
    </>
  );
}
