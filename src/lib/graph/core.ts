// src/lib/graph.ts
import { API } from "@/lib/constants";
import { Node, Link, GraphData } from "@/lib/types";
import * as THREE from "three";
import { WIKIPEDIA_ICON_URL } from "@/lib/constants";

// Fetch "Today's Featured Article" (Initial) Node
export async function fetchInitialNode(): Promise<Node> {
  const res = await fetch(`${API}/today`);
  const responseJson = await res.json();
  return responseJson.node as Node;
}

// Given a Node node, fetch up to limit related nodes (related <-> hyperlinked)
export async function fetchLinkedNodes(
  node: Node,
  limit: number = 256,
): Promise<Node[]> {
  const res = await fetch(`${API}/links?title=${node.name}&limit=${limit}`);
  const { nodes } = await res.json();
  return nodes as Node[];
}

// Given a Node node, fetch the html article of it from wikipedia
export async function fetchNodeInfo(node: Node): Promise<string> {
  const res = await fetch(`${API}/info?title=${node.name}`);
  const { html } = await res.json();
  return html;
}

// Given a node and it's newNodes, and the old state of the graph, merge the data
export function mergeGraphData(
  node: Node,
  newNodes: Node[],
  oldData: graphData,
): graphData {
  const existingIds = new Set(oldData.nodes.map((n) => n.id));

  const nodesToAdd: Node[] = newNodes.filter((n) => !existingIds.has(n.id));
  const existingNodeIds = newNodes
    .filter((n) => existingIds.has(n.id))
    .map((n) => n.id);

  const newLinks: Link[] = [
    ...nodesToAdd.map((n) => ({ source: node.id, target: n.id })),
    ...existingNodeIds.map((id) => ({ source: node.id, target: id })),
  ];

  return {
    nodes: [...oldData.nodes, ...nodesToAdd],
    links: [...oldData.links, ...newLinks],
  } as graphData;
}

// create the THREE.Sprite object to represent an article node
export function createNodeSprite(node: Node): THREE.Sprite {
  const texture = new THREE.TextureLoader().load(
    node.thumbnail?.source || WIKIPEDIA_ICON_URL,
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
  sprite.scale.set(width, height, 1);

  return sprite;
}

// return a vector with the graph center
export function getGraphCenter(data: GraphData): THREE.Vector3 {
  if (!data.nodes || data.nodes.length === 0) return new THREE.Vector3(0, 0, 0);
  let sumX = 0,
    sumY = 0,
    sumZ = 0;
  data.nodes.forEach((node) => {
    sumX += node.x;
    sumY += node.y;
    sumZ += node.z;
  });
  const n = data.nodes.length;
  return new THREE.Vector3(sumX / n, sumY / n, sumZ / n);
}

// return the radius of the graph
export function getGraphRadius(data: GraphData, center: THREE.Vector3): number {
  let maxDist = 0;
  data.nodes.forEach((node) => {
    const dx = node.x - center.x;
    const dy = node.y - center.y;
    const dz = node.z - center.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist > maxDist) maxDist = dist;
  });
  return maxDist;
}
