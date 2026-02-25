// src/lib/graph/core.ts
import { API_ROUTES } from "@/lib/constants";
import { GraphNode, GraphLink, GraphData } from "@/types";
import * as THREE from "three";
import { WIKIPEDIA_ICON_URL } from "@/lib/constants";
import { apiFetch } from "@/lib/api";
import { todaysDate } from "@/lib/utils";
import chroma from "chroma-js";

// Fetch the graph json from supabase
export async function fetchGraph(): Promise<{
  graph: GraphData;
  nodesCount: number;
  linksCount: number;
}> {
  const response = await apiFetch<{
    graph: GraphData;
    nodesCount: number;
    linksCount: number;
  }>({
    route: API_ROUTES.GRAPH,
    params: { date: todaysDate() },
  });
  console.log("Fetching today's graph:", todaysDate());
  return response;
}

// Fetch "Today's Featured Article" (Initial) Node
export async function fetchInitialNode(): Promise<GraphNode> {
  const response = await apiFetch<{ node: GraphNode }>({
    route: API_ROUTES.TODAY,
    params: { date: todaysDate() },
  });
  console.log("Fetching todays AOTD:", todaysDate());
  return response.node;
}

// Fetch a new node given it's title
export async function fetchNode(
  title: string | undefined,
  sourceID: number | string,
): Promise<GraphNode | undefined> {
  if (!title || !sourceID) return;
  const response = await apiFetch<{ node: GraphNode }>({
    route: API_ROUTES.LINK,
    params: { title, sourceID: sourceID.toString(), date: todaysDate() },
  });
  return response.node;
}

// Given a Node node, fetch up to limit related nodes (related <-> hyperlinked)
export async function fetchLinkedNodes(
  node: GraphNode,
  limit: number = 64,
): Promise<GraphNode[]> {
  if (!node.name) {
    return [];
  }
  const response = await apiFetch<{ nodes: GraphNode[] }>({
    route: API_ROUTES.LINKS,
    params: { title: node.name, limit: String(limit) },
  });
  return response.nodes;
}

// Given a Node node, fetch the html article of it from wikipedia
export async function fetchNodeInfo(name: string): Promise<string> {
  const response = await apiFetch<{ html: string }>({
    route: API_ROUTES.INFO,
    params: { title: name },
  });
  return response.html;
}

// Given a node and it's newNodes, and the old state of the graph, merge the data
export function mergeGraphData(
  node: GraphNode,
  newNodes: GraphNode[],
  oldData: GraphData,
): GraphData {
  const existingIds = new Set(oldData.nodes.map((n: GraphNode) => n.id));

  const nodesToAdd: GraphNode[] = newNodes.filter(
    (n) => !existingIds.has(n.id),
  );
  const existingNodeIds = newNodes
    .filter((n) => existingIds.has(n.id))
    .map((n) => n.id);

  const newLinks: GraphLink[] = [
    ...nodesToAdd.map((n) => ({ source: node.id, target: n.id }) as GraphLink),
    ...existingNodeIds.map(
      (id) => ({ source: node.id, target: id }) as GraphLink,
    ),
  ];

  return {
    nodes: [...oldData.nodes, ...nodesToAdd],
    links: [...oldData.links, ...newLinks],
  } as GraphData;
}

// create the THREE.Sprite object to represent an article node
export function createNodeSprite(
  node: GraphNode,
  graphData: GraphData,
  size: number,
): THREE.Sprite {
  const texture = new THREE.TextureLoader().load(
    node.thumbnail?.source ?? WIKIPEDIA_ICON_URL,
  );
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(material);

  let width = node.thumbnail?.width || 64;
  let height = node.thumbnail?.height || 64;

  const MAX_SIZE = 128;
  const SCALE_FACTOR = 0.1;

  const maxDim = Math.max(width, height);
  if (maxDim > 0) {
    const scale = (MAX_SIZE / maxDim) * SCALE_FACTOR;
    width *= scale;
    height *= scale;
  }
  sprite.scale.set(width * size, height * size, 1);

  return sprite;
}

// update a THREE.Sprite object to be "highlighted" (opaque) or not
export function updateSpriteHighlight(
  sprite: THREE.Sprite,
  distance: number,
  maxDistance: number,
) {
  const material = sprite.material as THREE.SpriteMaterial;
  const t = maxDistance > 0 ? Math.min(distance / maxDistance, 1) : 0;
  material.opacity = 1 - t * 0.95;
  material.color.setHex(t > 0.5 ? 0x888888 : 0xffffff);
}

// get the degree of a node (count of it's connections in the graph)
export function getNodeDegree(node: GraphNode, data: GraphData): number {
  let degree = 0;
  data.links.forEach((link) => {
    if (link.source === node.id || link.target === node.id) degree++;
    else if (link.source === node || link.target === node) degree++;
  });
  return degree;
}

// get the root node
export function getRootNode(
  data: GraphData,
  featured_date: string,
): GraphNode | null {
  for (const node of data.nodes) {
    if (node.featured_date === featured_date) {
      return node;
    }
  }
  return null;
}

// since the graph initially uses numerical ids, but in runtime uses GraphNode objects, this function normalizes either to an id value.
export function resolveID(
  node: string | number | GraphNode | undefined,
): string | number | undefined {
  if (node == null) return undefined;
  if (typeof node === "object") return node.id;
  return node;
}

export function computeNodeDepths(
  root: string | number | GraphNode,
  data: GraphData,
  maxDepth?: number,
): Map<string | number, number> {
  const rootId = resolveID(root);
  if (rootId == null) return new Map();

  const depths = new Map<string | number, number>();
  depths.set(rootId, 0);
  const queue: Array<string | number> = [rootId];

  // Build adjacency list keyed by resolved IDs
  const adjacency = new Map<string | number, Set<string | number>>();
  data.links.forEach((link) => {
    const src = resolveID(link.source);
    const tgt = resolveID(link.target);
    if (src == null || tgt == null) return;

    if (!adjacency.has(src)) adjacency.set(src, new Set());
    if (!adjacency.has(tgt)) adjacency.set(tgt, new Set());
    adjacency.get(src)!.add(tgt);
    adjacency.get(tgt)!.add(src);
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDepth = depths.get(current)!;
    if (maxDepth !== undefined && currentDepth >= maxDepth) continue;
    adjacency.get(current)?.forEach((neighbour) => {
      if (!depths.has(neighbour)) {
        depths.set(neighbour, currentDepth + 1);
        queue.push(neighbour);
      }
    });
  }

  return depths;
}

// Map a depth + maxDepth to a hex colour along a gradient
export function depthToColor(depth: number, maxDepth: number): string {
  const t = maxDepth > 0 ? Math.min(depth / maxDepth, 1) : 0;
  const scale = chroma.scale("Spectral");
  return scale(t).hex();
}
