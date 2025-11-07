import QuickLRU from "quick-lru";
import { GraphNode } from "@/types/wikipedia";

export const responseCache = new QuickLRU<
  string,
  string | GraphNode | GraphNode[]
>({
  maxSize: 1000,
  maxAge: 3.6e6,
});
