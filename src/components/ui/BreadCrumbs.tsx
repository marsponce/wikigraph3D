// src/components/ui/BreadCrumbs.tsx
import type { GraphNode, GraphData } from "@/types";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type BreadCrumbsProps = {
  className?: string;
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  graphData: GraphData;
};
export default function BreadCrumbs({
  className,
  selectedNode,
  setSelectedNode,
  graphData,
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
      newBreadcrumbs = [...breadcrumbs, selectedNode.name!];
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
        } else {
          setSelectedNode(null);
        }
      } else {
        setSelectedNode(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [graphData.nodes, setSelectedNode]);

  return (
    <>
      <nav className={clsx(className ?? "", "breadcrumbs")}>
        <div className="breadcrumbs-inner">
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((nodeName, index) => (
              <span key={index}>
                {index > 0 && " → "}
                <button
                  className="breadcrumb"
                  onClick={() => {
                    const stepsBack = breadcrumbs.length - index - 1;

                    if (stepsBack > 0) {
                      // Truncate breadcrumbs to this point
                      const truncated = breadcrumbs.slice(0, index + 1);
                      setBreadcrumbs(truncated);

                      // Mark that this is a breadcrumb click
                      isBreadcrumbClick.current = true;

                      // Go back in history
                      window.history.go(-stepsBack);
                    }
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
