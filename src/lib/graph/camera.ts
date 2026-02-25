// src/lib/graph/camera.ts
import { RefObject } from "react";
import { GraphNode, GraphLink, GraphData } from "@/types";
import * as THREE from "three";
import type { ForceGraphMethods } from "react-force-graph-3d";

// return a vector with the graph center
export function getGraphCenter(data: GraphData): THREE.Vector3 {
  if (!data.nodes || data.nodes.length === 0) return new THREE.Vector3(0, 0, 0);
  let sumX = 0,
    sumY = 0,
    sumZ = 0;
  data.nodes.forEach((node) => {
    sumX += node.x!;
    sumY += node.y!;
    sumZ += node.z!;
  });
  const n = data.nodes.length;
  return new THREE.Vector3(sumX / n, sumY / n, sumZ / n);
}

// return the radius of the graph
export function getGraphRadius(data: GraphData, center: THREE.Vector3): number {
  let maxDist = 0;
  data.nodes.forEach((node) => {
    const dx = node.x! - center.x!;
    const dy = node.y! - center.y!;
    const dz = node.z! - center.z!;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist > maxDist) maxDist = dist;
  });
  return maxDist;
}

// Focus the camera on a node
export function focusCameraOnNode(
  fgRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>,
  selectedNode: GraphNode | null,
  data: GraphData,
) {
  if (!selectedNode || !fgRef.current) return;

  const camera = fgRef.current.camera();
  const center = getGraphCenter(data);
  const radius = getGraphRadius(data, center);
  const minDistanceBase = 25;
  const maxDistanceBase = 250;
  const distanceBase = Math.min(
    Math.max(radius, minDistanceBase),
    maxDistanceBase,
  );
  const neighborFactor = 0.75;

  const connectedNodes = data.links.filter(
    (link: GraphLink) =>
      link.source === selectedNode || link.target === selectedNode,
  ).length;

  const distance = distanceBase + connectedNodes * neighborFactor;

  const dir = new THREE.Vector3(
    selectedNode.x! - camera.position.x,
    selectedNode.y! - camera.position.y,
    selectedNode.z! - camera.position.z,
  ).normalize();

  const newCameraPos = new THREE.Vector3(
    selectedNode.x! - dir.x * distance,
    selectedNode.y! - dir.y * distance,
    selectedNode.z! - dir.z * distance,
  );

  camera.up.set(0, 1, 0);

  fgRef.current.cameraPosition(
    newCameraPos,
    new THREE.Vector3(selectedNode.x, selectedNode.y, selectedNode.z),
    1500,
  );
}

// Set the camera back to view the whole graph
export function focusCameraOnGraph(
  fgRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>,
  data: GraphData,
) {
  if (!fgRef.current || !data.nodes || data.nodes.length === 0) return;

  const center = getGraphCenter(data);
  let radius = getGraphRadius(data, center);
  if (radius <= 10) {
    radius = 10;
  }

  const cameraOffset = new THREE.Vector3(0, 0, radius * 2);
  const newCameraPos = center.clone().add(cameraOffset);

  fgRef.current.camera().up.set(0, 1, 0);

  fgRef.current.cameraPosition(newCameraPos, center, 1500);
}

// Zoom to fit the graph in the camera's view
export function zoomToFit(
  fgRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>,
) {
  if (!fgRef.current) return;
  fgRef.current.zoomToFit(500);
}
