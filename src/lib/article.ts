// src/lib/article.ts
import * as cheerio from "cheerio";
import { API } from "@/lib/constants";

// Given an article title fetch the html for the relevant article
export async function fetchArticle(title: string): Promise<string> {
  const res = await fetch(`${API}/article?title=${title}`);
  const { html } = await res.json();
  return html;
}

// Server-side
export function slimArticle(fullHtml: string | null): string {
  if (!fullHtml) return "<h6> No Article provided... </h6>";
  const $ = cheerio.load(fullHtml);
  // Parse the document
  // Stuff to drop
  const DROP = [
    ".metadata",
    ".infobox",
    ".toc",
    ".navbox",
    ".vertical-navbox",
    ".ambox",
    ".hatnote",
    ".reflist",
    ".mw-empty-elt",
    "aside",
    "script",
    "style",
    "noscript",
    "iframe",
    "sup.reference",
  ];
  DROP.forEach((sel) => $(sel).remove());

  // Cleanup
  $("span:empty. p:empty").remove();
  const slim = $("body").length ? $("body").html() : "";
  slim!.trim();
  return slim!;
}
