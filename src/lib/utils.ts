// src/lib/utils.ts

import type { MediaWikiResponse, Page, GraphNode } from "@/types/wikipedia";
import DOMPurify from "isomorphic-dompurify";

// Convert a page object into a Node object
// NOTE: This function does not work with the today route completeley -> see src/app/api/wikipedia/today/route.ts
export function normalizePageToNode(page: Page): GraphNode {
  return {
    id: page.pageid,
    name: page.title,
    thumbnail: page.thumbnail ?? null,
    content: {
      desktop: {
        page: page.fullurl ?? null,
        edit: page.editurl ?? null,
        canonical: page.canonicalurl ?? null,
      },
      mobile: {
        page:
          page.fullurl?.replace("en.wikipedia.org", "en.m.wikipedia.org") ??
          null,
        edit:
          page.editurl?.replace("en.wikipedia.org", "en.m.wikipedia.org") ??
          null,
      },
    },
    description: page.description ?? null,
    extract: page.extract ?? null,
  };
}

export function normalizeMediaWikiResponse(
  response: MediaWikiResponse,
): GraphNode[] {
  if (!response.query?.pages) return [];

  return Object.values(response.query.pages).map(normalizePageToNode);
}

const WIKI_BASE = "https://en.wikipedia.org";

// Classes/sections to drop entirely
const DROP_SELECTORS = [
  ".infobox",
  ".toc",
  ".navbox",
  ".vertical-navbox",
  ".metadata",
  ".ambox",
  ".hatnote",
  ".reflist",
  ".mw-empty-elt",
  "table",
  "figure",
  "aside",
  "script",
  "style",
  "noscript",
  "iframe",
  "math",
  "sup.reference",
].join(",");

// Tags to skip (don't copy, just traverse children)
const SKIP_TAGS = new Set(["STYLE", "SCRIPT", "NOSCRIPT", "IFRAME", "MATH"]);

// Allowed output tags
const ALLOWED_TAGS = ["a", "p", "ul", "ol", "li", "strong", "em", "b", "i"];

export function slimWikiHTML(fullHtml: string): string {
  const doc = new DOMParser().parseFromString(fullHtml, "text/html");

  // Start from article content if present
  const root =
    doc.querySelector("#mw-content-text") ??
    doc.querySelector("main") ??
    doc.body;

  // Remove known non-content sections up front
  root.querySelectorAll(DROP_SELECTORS).forEach((el) => el.remove());

  // Build a minimal fragment
  const out = doc.createElement("div");
  let currentP = doc.createElement("p");
  out.appendChild(currentP);

  const newParagraph = () => {
    if (currentP.textContent?.trim()) {
      const np = doc.createElement("p");
      out.appendChild(np);
      currentP = np;
    }
  };

  const absolutize = (href: string) => {
    if (!href) return "#";
    if (/^https?:\/\//i.test(href)) return href;
    if (href.startsWith("/")) return WIKI_BASE + href;
    return href;
  };

  const walk = (node: Node) => {
    if (!node) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? "").replace(/\s+/g, " ");
      if (text.trim()) currentP.appendChild(doc.createTextNode(text));
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;

    if (SKIP_TAGS.has(el.tagName)) return;

    // Drop elements by selector dynamically (just in case)
    if (el.matches(DROP_SELECTORS)) return;

    const tag = el.tagName.toLowerCase();

    if (tag === "br") {
      newParagraph();
      return;
    }

    if (tag === "a") {
      const a = doc.createElement("a");
      a.setAttribute("href", absolutize(el.getAttribute("href") ?? ""));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
      a.textContent = el.textContent ?? "";
      currentP.appendChild(a);
      return;
    }

    // Start a new paragraph at common block boundaries
    if (["p", "li", "div", "section", "h2", "h3"].includes(tag)) {
      newParagraph();
    }

    // Recurse children
    el.childNodes.forEach(walk);

    if (["p", "li", "div", "section"].includes(tag)) {
      newParagraph();
    }
  };

  root.childNodes.forEach(walk);

  // Sanitize to a tiny whitelist (no style/class)
  const clean = DOMPurify.sanitize(out.innerHTML, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
    USE_PROFILES: { html: true },
  });

  return clean;
}
