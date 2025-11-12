import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
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
export default function ArticleCard({
  className,
  name,
  selectedNode,
  setSelectedNode,
  setGraphData,
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
        articleCache.set(name, slim, { maxAge: 1 }); // TODO: Replace maxAge here when debug is finished
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

        const href = link.getAttribute("href")?.replace("./", "");
        console.log("Link clicked:", href);

        // TODO: Make an api call, add the new node to the graph, set selected node to that node
        (async () => {
          const newNode = await fetchNode(href);
          if (!newNode || !selectedNode) return;
          console.log("newNode:", newNode, "selectedNode:", selectedNode.name);
          setGraphData((oldData) =>
            mergeGraphData(selectedNode, [newNode], oldData),
          );
          setSelectedNode(newNode);
        })();
      }
    };

    if (article) article.addEventListener("click", handleClick);

    return () => {
      if (article) {
        article.removeEventListener("click", handleClick);
      }
    };
  }, [html, selectedNode, setGraphData]);

  return (
    <>
      <article
        ref={articleRef}
        className={clsx("articlecard", className ?? "")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
