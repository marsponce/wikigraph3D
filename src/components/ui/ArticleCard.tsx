import { fetchNodeInfo } from "@/lib/graph/core";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { articleCache } from "@/lib/cache";
import { fetchArticle } from "@/lib/article";

type ArticleCardProps = {
  className?: string;
  name: string | undefined;
};
export default function ArticleCard({ className, name }: ArticleCardProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    if (!name) {
      setHtml("<h6>No node selected...</h6>");
      return;
    } else {
      setHtml("<h6>Loading...</h6>");
    }
    let slim;
    // TODO: Rewrite fetchNodeInfo to fetchArticle to run on SERVER
    if (articleCache.has(name)) {
      slim = articleCache.get(name);
      setHtml(slim as string);
      console.log(name, "hit", "expiresIn:", articleCache.expiresIn(name));
    } else {
      (async () => {
        slim = await fetchArticle(name);
        // slim = slimWikiHTML(html);
        setHtml(slim);
        articleCache.set(name, slim);
        console.log(name, "miss");
      })();
    }
  }, [name]);

  return (
    <>
      <article
        className={clsx("articlecard", className ?? "")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
