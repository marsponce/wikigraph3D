// src/lib/graph.ts
import { API } from "@/lib/constants";
import { Node, Link, GraphData } from "@/lib/types";

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
