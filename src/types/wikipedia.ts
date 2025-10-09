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
export interface Node {
  id: number;
  name: string;
  description?: string;
  extract?: string;
  thumbnail?: {
    source: string;
    width?: number;
    height?: number;
  };
  content?: {
    desktop?: {
      page: string;
      edit?: string;
      revisions?: string;
      talk?: string;
      canonical?: string;
    };
    mobile?: {
      page: string;
      edit?: string;
      revisions?: string;
      talk?: string;
    };
  };
  relevance?: number;
  html?: string;
}

// Link Object
export interface Link {
  source: string;
  target: string;
}

// Graph Data Object
export interface GraphData {
  nodes: Node[];
  links: Link[];
}
