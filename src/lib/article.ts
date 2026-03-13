// src/lib/article.ts
import * as cheerio from "cheerio";
import { API_ROUTES } from "@/lib/constants";
import { apiFetch } from "@/lib/api";

// Given an article title fetch the html for the relevant article
export async function fetchArticle(title: string): Promise<string> {
  const response = await apiFetch<{ html: string }>({
    route: API_ROUTES.ARTICLE,
    params: { title },
  });
  return response.html;
}

// Server-side
export function slimArticle(fullHtml: string | null): string {
  if (!fullHtml) return "<h6> No Article provided... </h6>";
  const $ = cheerio.load(fullHtml);
  // slim the article

  // Stuff to drop TODO: Finalize this in a later ticket
  const DROP = [
    "link[rel^='mw:']",
    "link[rel^='mw-deduplicated']",
    "meta",
    "style",
    "mw-editsection",
    ".navbox",
    ".navbox-styles",
    ".navbox-inner",
    ".navbox-subgroup",
    ".mw-collapsible",
    ".sidebar",
    ".sister-bar",
    ".noprint",
    ".metadata",
  ];
  DROP.forEach((sel) => $(sel).remove());

  const ALLOW_CLASSES = new Set([
    // --- Headings ---
    "mw-heading", // Parsoid wrapper div around all headings
    "mw-heading2", // h2 level
    "mw-heading3", // h3 level
    "mw-heading4", // h4 level

    // --- Figures & Images ---
    "mw-default-size", // Parsoid default image sizing
    "mw-halign-left", // Float image left
    "mw-halign-right", // Float image right
    "mw-file-description", // Anchor wrapping images
    "mw-file-element", // The img element itself
    "thumbinner", // Wrapper inside a thumb figure
    "thumbimage", // The image container inside thumbinner
    "thumbcaption", // Caption inside a thumb
    "skin-invert-image", // Invert this image

    // --- Multi-image layouts ---
    "multiimageinner", // Outer wrapper for multi-image blocks
    "trow", // Row in a multi-image layout
    "tsingle", // Single image cell in a multi-image layout

    // --- Location maps ---
    "locmap", // Outer map container
    "noresize", // Prevents map resizing
    "notpageimage", // Prevents image being used as page thumbnail
    "noviewer", // Disables media viewer on click
    "od", // Overlay dot container (holds position via inline style)
    "id", // Inner dot (the actual red dot image)
    "pr", // Label to the right of a map dot

    // --- Tables ---
    "wikitable", // Standard Wikipedia styled table
    "infobox", // Infobox table (right-floating info panel)
    "infobox-title", // Infobox Title

    // --- Lists & Columns ---
    "div-col", // Multi-column list wrapper
    "gallery", // Image gallery
    "gallerybox", // Gallery box
    "thumb",
    "mw-gallery-nolines", // no lines gallery

    // --- References ---
    "reference", // Inline superscript citation
    "references", // The references list
    "reflist", // Wrapper around references list
    "refbegin", // Wrapper for bibliography/sources sections
    "mw-references-wrap", // Parsoid outer reference wrapper
    "mw-references-columns", // Multi-column references layout
    "mw-ref", // Parsoid inline reference superscript
    "mw-reflink-text", // The [1] text inside a ref link
    "cite-bracket", // The [ and ] around ref numbers
    "reference-text", // The actual text of a reference entry
    "citation", // cite element inside a reference
    "quotebox", // block quotes

    // --- Portal box ---
    "portalbox", // Floating box with portal links (e.g. "Politics portal")

    // --- Side box ---
    "side-box",
    "side-box-right",
    "side-box-flex",
    "side-box-image",
    "side-box-text",

    // --- Misc ---
    "catlinks", // Category links at the bottom of the article
    "footballbox",
    "mw-invert",
    "skin-invert",

    // --- Math ---
    "texhtml",
    "mwe-math-element",
    "mwe-math-fallback-image-inline",
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

  // Remove all default styling
  // $("[style]").removeAttr("style");

  // Switch outside wikipedia <a> tags to open in new window
  $("a").each((i, link) => {
    const href = $(link).attr("href");

    if (href && !href.startsWith("#")) {
      // /wiki/<Article Title> links are handled locally
      $(link).attr("target", "_blank");
      $(link).attr("rel", "noopener noreferrer");
    }
  });

  // Add scrollable containers to tables
  $("table:not([class])").wrap('<div class="overflow-wrap"></div>');

  // Clean colour styling from table
  $("table.infobox th, table.infobox td").each((_, el) => {
    const $el = $(el);
    const style = $el.attr("style") || "";
    const cleaned = style
      .split(";")
      .map((s) => s.trim())
      .filter((s) => !s.startsWith("background") && !s.startsWith("color"))
      .join("; ");

    if (cleaned) $el.attr("style", cleaned);
    else $el.removeAttr("style");
  });

  // Mark styled tables for styling
  $("table").each((_, el) => {
    const $el = $(el);
    const hasColorStyling = $el
      .find("[style]")
      .toArray()
      .some((child) => {
        const style = $(child).attr("style") || "";
        return style.match(/background|color/i);
      });
    if (hasColorStyling) $el.wrap('<div class="color-diagram"></div>');
  });

  // Cleanup
  $("span:empty. p:empty").remove();
  $("*")
    .contents()
    .each((_, node) => {
      if (node.type === "comment") $(node).remove();
    });
  const slim = $("body").length ? $("body").html() : "";
  slim!.trim();
  console.debug("Slimming article complete!");
  return slim!;
}
