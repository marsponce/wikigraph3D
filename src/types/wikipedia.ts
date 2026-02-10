// src/types/wikipedia.ts

// Page object returned in the MediaWiki api response
export interface Page {
  pageid?: number;
  id?: number;
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
  created_at?: string;
  name?: string;
  x?: number;
  y?: number;
  z?: number;
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
}

// Link Object
export interface GraphLink {
  id?: number;
  created_at?: string;
  source?: number | string | GraphNode | undefined;
  target?: number | string | GraphNode | undefined;
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
