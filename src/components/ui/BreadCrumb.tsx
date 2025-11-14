// src/components/ui/BreadCrumb.tsx
import type { GraphNode, GraphData } from "@/types";
import { useEffect, useRef, useState } from "react";

type BreadCrumbProps = {
  className?: string;
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  graphData: GraphData;
};

export default function BreadCrumb({
  className,
  selectedNode,
  setSelectedNode,
  graphData,
}: BreadCrumbProps) {
  // Store breadcrumbs as state for component UI
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const isPopState = useRef<boolean>(false);
  // Create initial history entry on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("article");
    window.history.replaceState(
      { breadcrumbs: breadcrumbs },
      "",
      url.toString(),
    );
  }, []);

  // Update URL Whenever selectedNode changes
  useEffect(() => {
    if (isPopState.current) {
      isPopState.current = false;
      return;
    }

    const url = new URL(window.location.href);
    let newBreadcrumbs: string[];

    if (selectedNode) {
      newBreadcrumbs = [...breadcrumbs, selectedNode.name as string];
      url.searchParams.set("article", encodeURIComponent(selectedNode.name!));
    } else {
      newBreadcrumbs = [];
      url.searchParams.delete("article");
    }
    setBreadcrumbs(newBreadcrumbs);
    window.history.pushState({ breadcrumbs: breadcrumbs }, "", url.toString());
  }, [selectedNode]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      isPopState.current = true;

      if (event.state?.breadcrumbs) {
        setBreadcrumbs(event.state.breadcrumbs);
      }

      const params = new URLSearchParams(window.location.search);
      const article = params.get("article");

      if (article) {
        const articleName = decodeURIComponent(article);
        const node = graphData.nodes.find((n) => n.name === articleName);
        if (node) setSelectedNode(node);
        else setSelectedNode(null);
      } else setSelectedNode(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [graphData.nodes, setSelectedNode]);
  return (
    <>
      <div className={className ?? ""}>
        {breadcrumbs.length > 0 ? (
          breadcrumbs.map((nodeName, index) => (
            <span key={index}>
              {index > 0 && " → "}
              <button
                onClick={() => {
                  // Find the node by name when clicked
                  const node = graphData.nodes.find((n) => n.name === nodeName);
                  if (node) setSelectedNode(node);
                }}
              >
                {nodeName}
              </button>
            </span>
          ))
        ) : (
          <p>No articles selected</p>
        )}
      </div>
    </>
  );
}
