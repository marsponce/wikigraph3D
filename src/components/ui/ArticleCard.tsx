import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { articleCache } from "@/lib/cache";
import { fetchArticle } from "@/lib/article";
import type { GraphNode } from "@/types";

type ArticleCardProps = {
  className?: string;
  name: string | undefined;
  setSelectedNode: (node: GraphNode | null) => void;
};
export default function ArticleCard({ className, name }: ArticleCardProps) {
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

        const href = link.getAttribute("href");
        console.log("Link clicked:", href);

        // TODO: Make an api call, add the new node to the graph, set selected node to that node
      }
    };

    if (article) article.addEventListener("click", handleClick);

    return () => {
      if (article) {
        article.removeEventListener("click", handleClick);
      }
    };
  }, [html]);

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
