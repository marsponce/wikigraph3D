import { fetchNodeInfo } from "@/lib/graph/core";
import { useState, useEffect } from "react";
import { slimWikiHTML } from "@/lib/utils";
import clsx from "clsx";

type ArticleCardProps = {
  className?: string;
  name: string | undefined;
};
export default function ArticleCard({ className, name }: ArticleCardProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    if (!name) return;
    (async () => {
      setHtml("");
      const html = await fetchNodeInfo(name);
      const slim = slimWikiHTML(html);
      setHtml(slim);
    })();
  }, [name]);

  return (
    <>
      <div
        className={clsx("prose dark:prose-invert articlecard", className ?? "")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
