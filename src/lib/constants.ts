// src/lib/constants.ts

// Base URL for Wikipedia API
export const WIKI_API_BASE = "https://en.wikipedia.org/w/api.php";

// Base URL for Wikipedia Articles API
export const WIKI_INFO_BASE = "https://en.wikipedia.org/api/rest_v1";

// Base URL for Wikimedia API to get Today's Featured Article (TFA)
export const TFA_API_BASE = "https://api.wikimedia.org/feed/v1/wikipedia";

// Wikipedia Icon URL
export const WIKIPEDIA_ICON_URL =
  "https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png";

// Backend API Base
export const API = "/api/wikipedia";

// Backend API Routes
export const API_ROUTES = {
  TODAY: "/today",
  ARTICLE: "/article",
  LINK: "/link",
  LINKS: "/links",
  INFO: "/info",
  GRAPH: "/graph",
} as const;

export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES];
