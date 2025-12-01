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
  console.log("Slimming article...");
  if (!fullHtml) return "<h6> No Article provided... </h6>";
  const $ = cheerio.load(fullHtml);
  // slim the article

  // Stuff to drop
  const DROP = [
    ".metadata",
    //    ".infobox",
    //    ".toc",
    ".navbox",
    ".vertical-navbox",
    //    ".ambox",
    //    ".hatnote",
    //    ".reflist",
    //    ".mw-empty-elt",
    //    "aside",
    "script",
    "style",
    "noscript",
    "iframe",
    ".shortdescription",
    ".mw-editsection",
  ];
  DROP.forEach((sel) => $(sel).remove());

  const ALLOW_CLASSES = new Set([
    "infobox",
    "wikitable",
    "portalbox",
    "reference",
    "reflist",
    "references",
    "refbegin",
    "catlinks",
  ]);
  // Remove non-allowed classes
  $("[class]").each((i, elt) => {
    const $elt = $(elt);
    const kept = ($elt.attr("class") || "")
      .split(/\s+/)
      .filter(Boolean)
      .filter((cls) => ALLOW_CLASSES.has(cls));

    if (kept.length) $elt.attr("class", kept.join(" "));
    else $elt.removeAttr("class");
  });

  // Switch outside wikipedia <a> tags to open in new window
  $("a").each((i, link) => {
    const href = $(link).attr("href");

    if (href && !href.startsWith("/wiki/") && !href.startsWith("#")) {
      $(link).attr("target", "_blank");
      $(link).attr("rel", "noopener noreferrer");
    }
  });

  // Cleanup
  $("span:empty. p:empty").remove();
  // Remove all default styling
  $("[style]").removeAttr("style");
  const slim = $("body").length ? $("body").html() : "";
  slim!.trim();
  console.log("Slimming article complete!");
  return slim!;
}
