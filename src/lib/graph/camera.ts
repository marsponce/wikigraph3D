// src/lib/graph/camera.ts
import { Node, graphData } from "@/lib/types";
import { getGraphCenter, getGraphRadius } from "./core";
import * as THREE from "three";

// Focus the camera on a node
export function focusCameraOnNode(fgRef, selectedNode: Node, data: graphData) {
  if (!selectedNode || !fgRef.current) return;

  const camera = fgRef.current.camera();
  const distanceBase = 10;
  const neighborFactor = 0.75;

  const connectedNodes = data.links.filter(
    (link) => link.source === selectedNode || link.target === selectedNode,
  ).length;

  const distance = distanceBase + connectedNodes * neighborFactor;

  const dir = new THREE.Vector3(
    selectedNode.x - camera.position.x,
    selectedNode.y - camera.position.y,
    selectedNode.z - camera.position.z,
  ).normalize();

  const newCameraPos = new THREE.Vector3(
    selectedNode.x - dir.x * distance,
    selectedNode.y - dir.y * distance,
    selectedNode.z - dir.z * distance,
  );

  camera.up.set(0, 1, 0);

  fgRef.current.cameraPosition(
    newCameraPos,
    new THREE.Vector3(selectedNode.x, selectedNode.y, selectedNode.z),
    1500,
  );
}

// Set the camera back to view the whole graph
export function focusCameraOnGraph(fgRef, data: graphData) {
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
