import {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
} from "react";
import clsx from "clsx";
import { articleCache } from "@/lib/cache";
import { fetchArticle } from "@/lib/article";
import { fetchNode, mergeGraphData } from "@/lib/graph";
import type { GraphNode, GraphData } from "@/types";
import { toast } from "sonner";

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
  const [error, setError] = useState<Error | null>(null);
  const [retries, setRetries] = useState<number>(0);

  // Reset Retries
  useEffect(() => {
    setRetries(0);
  }, [name]);

  // Load the article
  useEffect(() => {
    setError(null);
    if (!name) {
      setHtml("<h6>No node selected...</h6>");
      return;
    } else {
      setHtml("<h6>Loading...</h6>");
    }
    let slim;
    try {
      if (articleCache.has(name)) {
        slim = articleCache.get(name);
        setHtml(slim as string);
        console.log(name, "hit", "expiresIn:", articleCache.expiresIn(name));
      } else {
        fetchArticle(name)
          .then((html) => {
            setHtml(html);
            articleCache.set(name, html);
            console.log(name, "miss");
            setError(null);
            setRetries(0);
          })
          .catch((e) => {
            console.error("Failed to load article:", e);
            setError(e as Error);
            setHtml("");
          });
      }
    } catch (e) {
      console.error("Failed to get article from cache:", e);
      setError(e as Error);
      setHtml("");
    }
  }, [name, retries]);

  // Click handler
  const handleClick = useCallback(
    (e: MouseEvent) => {
      // Make an api call, add the new node to the graph, set selected node to that node
      const loadNewNode = (title: string) => {
        fetchNode(title)
          .then((newNode) => {
            // throw new Error("Test error"); // for testing
            if (newNode && selectedNode) {
              setGraphData((oldData) =>
                mergeGraphData(selectedNode, [newNode], oldData),
              );
              setSelectedNode(newNode);
            }
          })
          .catch((e) => {
            console.error("Failed to fetch new node:", e);
            toast.error("Failed to fetch new node", {
              action: {
                label: "Retry",
                onClick: () => loadNewNode(title),
              },
            });
          });
      };

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
          loadNewNode(title);
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

  // Handle retry fetching article
  const handleRetry = () => {
    setError(null);
    setRetries((prev) => prev + 1);
  };

  return (
    <>
      <article
        ref={articleRef}
        className={clsx(
          "w-full",
          "articlecard",
          "p-[1em]",
          "overflow-y-auto",
          "[content-visibility:auto] [contain-intrinsic-size:0_500px]",
          "transition-opacity duration-300",
          "pb-12",
          "opacity-100",
          className ?? "",
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {error && (
        <div className="fixed inset-0 z-50 flex flex-col justify-center items-center h-full w-full">
          <p>Something went wrong while loading this article. Please try again.</p>
          <br />
          <button
            type="button"
            className="p-3 text-lg pointer-events-auto rounded transition-colors duration-300 bg-gray-900 hover:bg-sky-600 active:bg-sky-100"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      )}
    </>
  );
});

export default ArticleCard;
