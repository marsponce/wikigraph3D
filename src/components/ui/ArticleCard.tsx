import { fetchNodeInfo } from "@/lib/graph/core";
import { useState, useEffect } from "react";
import { slimWikiHTML } from "@/lib/utils";

type ArticleCardProps = {
  name: string | undefined;
};
export default function ArticleCard({ name }: ArticleCardProps) {
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
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
