import {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
  memo,
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
  sidebarState: string;
};
export default function ArticleCard({
  className,
  name,
  selectedNode,
  setSelectedNode,
  setGraphData,
  sidebarState,
}: ArticleCardProps) {
  const [html, setHtml] = useState<string>("");
  const articleRef = useRef<HTMLElement>(null);

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

  // Intercept <a /> clicks
  useEffect(() => {
    const article = articleRef.current;
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (link) {
        e.preventDefault();

        const href = link.getAttribute("href");
        console.log("Link clicked:", href);

        // If the href is an internal link, it will start with /wiki.
        if (href && href.startsWith("/wiki/")) {
          // TODO: Make an api call, add the new node to the graph, set selected node to that node
          (async () => {
            const title = href.replace("/wiki/", "");
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
    };

    if (article) article.addEventListener("click", handleClick);

    return () => {
      if (article) {
        article.removeEventListener("click", handleClick);
      }
    };
  }, [html, selectedNode, setSelectedNode, setGraphData]);

  return (
    <>
      <article
        data-sidebar-state={sidebarState}
        ref={articleRef}
        className={clsx("articlecard", className ?? "")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
