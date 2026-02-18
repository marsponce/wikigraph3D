// src/lib/graph/stats.ts
import { resolveID, computeNodeDepths } from "@/lib/graph";
import type { GraphNode, GraphLink, GraphData } from "@/types";

export type GraphStats = {
  nodeCount: number;
  linkCount: number;
  degrees: Map<string | number, number>;
  maxDegree: number;
  maxDegreeNodes: GraphNode[];
  averageDegree: number;
  diameter: number;
  averagePathLength: number;
};

export function computeGraphStats(data: GraphData): GraphStats {
  const stats = <GraphStats>{};

  stats.nodeCount = data.nodes.length;
  stats.linkCount = data.links.length;

  stats.degrees = new Map<string | number, number>();
  data.nodes.forEach((node) => {
    if (node.id != null) stats.degrees.set(node.id, 0);
  });
  data.links.forEach((link) => {
    const src = resolveID(link.source);
    const tgt = resolveID(link.target);
    if (src != null) stats.degrees.set(src, (stats.degrees.get(src) ?? 0) + 1);
    if (tgt != null) stats.degrees.set(tgt, (stats.degrees.get(tgt) ?? 0) + 1);
  });

  stats.averageDegree =
    stats.nodeCount > 0
      ? Array.from(stats.degrees.values()).reduce((a, b) => a + b, 0) /
        stats.nodeCount
      : 0;

  stats.maxDegree =
    stats.degrees.size > 0
      ? Math.max(...Array.from(stats.degrees.values()))
      : 0;

  stats.maxDegreeNodes = Array.from(stats.degrees.entries())
    .sort((a, b) => b[1] - a[1]) // sort descending by degree
    .slice(0, 10) // take top 10
    .map(([id]) => data.nodes.find((n) => n.id === id)!) // resolve to GraphNode
    .filter(Boolean); // drop any unresolved nulls

  // Diameter + average path length via BFS from every node
  // This is O(n * (n + e)) so only practical for small-medium graphs
  let diameter = 0;
  let totalPathLength = 0;
  let totalPaths = 0;

  data.nodes.forEach((node) => {
    if (node.id == null) return;
    const depths = computeNodeDepths(node.id, data);
    depths.forEach((depth) => {
      if (depth > 0) {
        totalPathLength += depth;
        totalPaths++;
        if (depth > diameter) diameter = depth;
      }
    });
  });

  stats.diameter = diameter;

  stats.averagePathLength = totalPaths > 0 ? totalPathLength / totalPaths : 0;

  return stats;
}
