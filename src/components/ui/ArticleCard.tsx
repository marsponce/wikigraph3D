import {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
  useMemo,
  memo,
  useCallback,
} from "react";
import clsx from "clsx";
import { articleCache } from "@/lib/cache";
import { fetchArticle } from "@/lib/article";
import { fetchNode, mergeGraphData } from "@/lib/graph";
import type { GraphNode, GraphData } from "@/types";

type ArticleCardProps = {
  className?: string;
  name: string | undefined;
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  setGraphData: Dispatch<SetStateAction<GraphData>>;
};
const ArticleCard = memo(function ArticleCard({
  className,
  name,
  selectedNode,
  setSelectedNode,
  setGraphData,
}: ArticleCardProps) {
  const [html, setHtml] = useState<string>("");
  const articleRef = useRef<HTMLElement>(null);
  console.log("ArticleCard render", {
    name,
    selectedNodeName: selectedNode?.name,
    className,
  });
  // Load the article
  useEffect(() => {
    if (!name) {
      setHtml("<h6>No node selected...</h6>");
      return;
    } else {
      setHtml("<h6>Loading...</h6>");
    }
    let slim;
    if (articleCache.has(name)) {
      slim = articleCache.get(name);
      setHtml(slim as string);
      console.log(name, "hit", "expiresIn:", articleCache.expiresIn(name));
    } else {
      (async () => {
        slim = await fetchArticle(name);
        setHtml(slim);
        articleCache.set(name, slim);
        console.log(name, "miss");
      })();
    }
  }, [name]);

  // Click handler
  const handleClick = useCallback(
    (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (link) {
        const href = link.getAttribute("href");
        console.log("Link clicked:", href);

        // Handle citation/reference links (internal anchors)
        if (href && href.startsWith("#")) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            // Bounce for visibility
            targetElement.classList.add(
              "ring-4",
              "ring-white-400",
              "ring-opacity-50",
              "transition-all",
              "duration-1000",
              "rounded-xl",
            );

            setTimeout(() => {
              targetElement.classList.remove(
                "ring-4",
                "ring-white-400",
                "ring-opacity-50",
                "rounded-xl",
              );
            }, 2000);
          }
          return;
        }

        // If the href is an internal link, it will start with /wiki.
        if (href && href.startsWith("/wiki/")) {
          e.preventDefault();
          const title = href.replace("/wiki/", "");
          const externalNamespaces = [
            "File:",
            "Image:",
            "Category:",
            "Special:",
            "User:",
            "User_talk:",
            "Wikipedia:",
            "Wikipedia_talk:",
            "Talk:",
            "Template:",
            "Help:",
            "Portal:",
          ];

          // Check if title starts with any external namespace
          const isExternal = externalNamespaces.some((ns) =>
            title.startsWith(ns),
          );

          if (isExternal || title.includes("_talk:")) {
            window.open(`https://en.wikipedia.org${href}`, "_blank");
            return;
          }
          // Make an api call, add the new node to the graph, set selected node to that node
          (async () => {
            const newNode = await fetchNode(title);
            if (!newNode || !selectedNode) return;
            console.log(
              "newNode:",
              newNode.name,
              "selectedNode:",
              selectedNode.name,
            );
            setGraphData((oldData) =>
              mergeGraphData(selectedNode, [newNode], oldData),
            );
            setSelectedNode(newNode);
          })();
        }
      }
    },
    [selectedNode, setSelectedNode, setGraphData],
  );

  // Intercept <a /> clicks
  useEffect(() => {
    const article = articleRef.current;
    if (article) article.addEventListener("click", handleClick);

    return () => {
      if (article) {
        article.removeEventListener("click", handleClick);
      }
    };
  }, [handleClick]);

  const memoizedHtml = useMemo(() => ({ __html: html }), [html]);
  return (
    <>
      <article
        ref={articleRef}
        className={clsx(
          "articlecard",
          "p-[1em]",
          "overflow-y-auto",
          "[content-visibility:auto] [contain-intrinsic-size:0_500px]",
          className ?? "",
        )}
        dangerouslySetInnerHTML={memoizedHtml}
      />
    </>
  );
});

export default ArticleCard;
