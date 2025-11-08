import QuickLRU from "quick-lru";
import { GraphNode } from "@/types/wikipedia";

export const responseCache = new QuickLRU<
  string,
  string | GraphNode | GraphNode[]
>({
  maxSize: 1024,
  maxAge: 3.6e6,
});

export const articleCache = new QuickLRU<string, string>({
  maxSize: 1024,
  maxAge: 1.8e6,
});
