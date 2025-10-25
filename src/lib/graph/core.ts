// src/lib/graph.ts
import { API } from "@/lib/constants";
import { GraphNode, GraphLink, GraphData } from "@/types";
import * as THREE from "three";
import { WIKIPEDIA_ICON_URL } from "@/lib/constants";

// Fetch "Today's Featured Article" (Initial) Node
export async function fetchInitialNode(): Promise<GraphNode> {
  const res = await fetch(`${API}/today`);
  const responseJson = await res.json();
  return responseJson.node as GraphNode;
}

// Given a Node node, fetch up to limit related nodes (related <-> hyperlinked)
export async function fetchLinkedNodes(
  node: GraphNode,
  limit: number = 64,
): Promise<GraphNode[]> {
  const res = await fetch(`${API}/links?title=${node.name}&limit=${limit}`);
  const { nodes } = await res.json();
  return nodes as GraphNode[];
}

// Given a Node node, fetch the html article of it from wikipedia
export async function fetchNodeInfo(node: GraphNode): Promise<string> {
  const res = await fetch(`${API}/info?title=${node.name}`);
  const { html } = await res.json();
  return html;
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
export function createNodeSprite(node: GraphNode): THREE.Sprite {
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

// update a THREE.Sprite object to be "highlighted" (opaque) or not
export function updateSpriteHighlight(
  sprite: THREE.Sprite,
  isHighlighted: boolean,
) {
  const material = sprite.material as THREE.SpriteMaterial;
  if (isHighlighted) {
    material.color.setHex(0xffffff);
    material.opacity = 1;
  } else {
    material.color.setHex(0x888888);
    material.opacity = 0.2;
  }
}
