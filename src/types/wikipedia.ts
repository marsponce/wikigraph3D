// src/types/wikipedia.ts

// Page object returned in the MediaWiki api response
export interface Page {
  pageid: number;
  ns: number;
  title: string;
  thumbnail?: {
    source: string;
    width?: number;
    height?: number;
  };
  contentmodel?: string;
  pagelanguage?: string;
  pagelanguagehtmlcode?: string;
  pagelanguagedir?: string;
  touched?: string;
  lastrevid?: number;
  length?: number;
  fullurl?: string;
  editurl?: string;
  canonicalurl?: string;
  description?: string;
  descriptionsource?: string;
  extract?: string;
}

// MediaWiki response object
export interface MediaWikiResponse {
  batchcomplete?: string;
  continue?: {
    gplcontinue?: string;
    continue?: string;
  };
  query?: {
    pages?: Record<string, Page>;
  };
}

// Node object
export interface GraphNode {
  id?: string | number | undefined;
  name?: string;
  x?: number;
  y?: number;
  z?: number;
  description?: string | null;
  extract?: string | null;
  thumbnail?: {
    source: string;
    width?: number;
    height?: number;
  } | null;
  content?: {
    desktop?: {
      page: string | null;
      edit?: string | null;
      revisions?: string | null;
      talk?: string | null;
      canonical?: string | null;
    } | null;
    mobile?: {
      page: string | null;
      edit?: string | null;
      revisions?: string;
      talk?: string;
    } | null;
  };
  relevance?: number;
  html?: string;
}

// Link Object
export interface GraphLink {
  source: number | string | GraphNode;
  target: number | string | GraphNode;
}

// Graph Data Object
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Graph Handle type
export type GraphHandle = {
  resetCamera: () => void;
  focusOnCamera: () => void;
};
