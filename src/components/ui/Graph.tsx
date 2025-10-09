"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useRef } from "react";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import { WIKIPEDIA_ICON_URL } from "@/lib/constants";
import { Node, Link, GraphData } from "@/lib/types";
import { fetchInitialNode, fetchLinkedNodes, fetchNodeInfo } from "@/lib/graph";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

function mergeGraphData(
  node: Node,
  newNodes: Node[],
  oldData: GraphData,
): GraphData {
  const existingIds = new Set(oldData.nodes.map((n) => n.id));

  // Split nodes into truly new vs already existing
  const nodesToAdd: Node[] = newNodes.filter((n) => !existingIds.has(n.id));
  const existingNodeIds = newNodes
    .filter((n) => existingIds.has(n.id))
    .map((n) => n.id);

  // Add links for all new nodes, also link to existing nodes
  const newLinks: Link[] = [
    ...nodesToAdd.map((n) => ({ source: node.id, target: n.id })),
    ...existingNodeIds.map((id) => ({ source: node.id, target: id })),
  ];

  return {
    nodes: [...oldData.nodes, ...nodesToAdd],
    links: [...oldData.links, ...newLinks],
  } as GraphData;
}

function createNodeSprite(node: Node): THREE.Group {
  const texture = new THREE.TextureLoader().load(
    node.thumbnail?.source || WIKIPEDIA_ICON_URL,
  );
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(material);

  // Default size
  let width = node.thumbnail?.width || 64;
  let height = node.thumbnail?.height || 64;

  // Scaling
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

function createNodeLabel(node: Node, spriteHeight: number): SpriteText {
  const label = new SpriteText(node.name || node.id);
  label.material.depthWrite = false; // background transparent
  label.color = node.color;
  label.textHeight = 2;

  // Offset below the image
  label.position.set(0, -spriteHeight / 2, 0);

  return label;
}

function focusCameraOnNode(fgRef, selectedNode: Node, data: graphData) {
  if (!selectedNode || !fgRef.current) return;

  const camera = fgRef.current.camera();
  const distanceBase = 100; // base distance from node
  const neighborFactor = 0.75; // extra distance per connected node

  // Count connected neighbors using your `data` prop/state
  const connectedNodes = data.links.filter(
    (link) => link.source === selectedNode || link.target === selectedNode,
  ).length;

  const distance = distanceBase + connectedNodes * neighborFactor;

  // Compute direction from current camera position to the selected node
  const dir = new THREE.Vector3(
    selectedNode.x - camera.position.x,
    selectedNode.y - camera.position.y,
    selectedNode.z - camera.position.z,
  ).normalize();

  // Move camera back along that direction by the distance
  const newCameraPos = new THREE.Vector3(
    selectedNode.x - dir.x * distance,
    selectedNode.y - dir.y * distance,
    selectedNode.z - dir.z * distance,
  );

  // Ensure camera up vector is y-up
  camera.up.set(0, 1, 0);

  // Smooth transition to new camera position
  fgRef.current.cameraPosition(
    newCameraPos,
    new THREE.Vector3(selectedNode.x, selectedNode.y, selectedNode.z),
    1500, // transition duration in ms
  );
}

function getGraphCenter(data: graphData): THREE.Vector3 {
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

function getGraphRadius(data: graphData, center: THREE.Vector3): number {
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

function resetGraphView(fgRef, data: graphData) {
  if (!fgRef.current || !data.nodes || data.nodes.length === 0) return;

  const center = getGraphCenter(data);
  const radius = getGraphRadius(data, center);

  // Pull the camera back along z-axis (or any preferred direction)
  const cameraOffset = new THREE.Vector3(0, 0, radius * 2); // multiply to give padding
  const newCameraPos = center.clone().add(cameraOffset);

  fgRef.current.camera().up.set(0, 1, 0); // y-up

  fgRef.current.cameraPosition(
    newCameraPos,
    center, // look at graph center
    1500, // transition duration
  );
}

function focusCameraOnNodeOld(
  fgRef,
  node: Node,
  distance: number = 100,
  duration: number = 3000,
) {
  if (!node || !fgRef.current) return;

  const hypot = Math.hypot(node.x, node.y, node.z);
  if (hypot == 0) {
    fgRef.current.cameraPosition(
      {
        x: node.x,
        y: node.y,
        z: node.z + distance + 1,
      },
      node,
      duration,
    );
  } else {
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
    fgRef.current.cameraPosition(
      {
        x: node.x * distRatio,
        y: node.y * distRatio,
        z: node.z * distRatio,
      },
      node,
      duration,
    );
  }
}

type GraphProps = {
  className?: string;
  selectedNode: Node;
  setSelectedNode: (node: Node) => void;
  data: graphData;
  setData: (graphData: graphData) => void;
};

export default function Graph({
  className,
  selectedNode,
  setSelectedNode,
  data,
  setData,
}: GraphProps) {
  const fgRef = useRef();

  useEffect(() => {
    (async () => {
      const root = await fetchInitialNode();
      setData({ nodes: [{ ...root, x: 0.1, y: 0.1, z: 0.1 }], links: [] });
    })();
  }, []);

  const expandGraph = useCallback(async (node) => {
    const newNodes = await fetchLinkedNodes(node);
    const CHUNK_SIZE = 16;
    const DELAY_MS = 1000;

    // Split newNodes into chunks of newNodes
    const nodeChunks: Node[][] = [];
    for (let i = 0; i < newNodes.length; i += CHUNK_SIZE) {
      nodeChunks.push(newNodes.slice(i, i + CHUNK_SIZE));
    }

    // Add each chunk one by one
    nodeChunks.forEach((chunk, idx) => {
      setTimeout(() => {
        setData((oldData) => mergeGraphData(node, chunk, oldData));
      }, idx * DELAY_MS);
    });
  }, []);

  const handleNodeClick = async (node) => {
    setSelectedNode(node);
  };

  useEffect(() => {
    focusCameraOnNode(fgRef, selectedNode, data);
    HighlightNode(selectedNode);
  }, [selectedNode, data]);

  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  const HighlightNode = (node) => {
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();

    if (node) {
      newHighlightNodes.add(node);

      // find all connected links and neighbors
      data.links.forEach((link) => {
        if (link.source === node) {
          newHighlightNodes.add(link.target);
          newHighlightLinks.add(link);
        } else if (link.target === node) {
          newHighlightNodes.add(link.source);
          newHighlightLinks.add(link);
        }
      });
    }
    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  };

  const nodeObjects = useRef<Map<Node, THREE.Sprite>>(new Map());

  const createNodeObject = (node: Node): THREE.Sprite => {
    const sprite = createNodeSprite(node);

    // Set initial highlight state
    updateSpriteHighlight(sprite, highlightNodes.has(node));

    return sprite;
  };

  // Helper to update sprite based on highlight
  const updateSpriteHighlight = (
    sprite: THREE.Sprite,
    isHighlighted: boolean,
  ) => {
    const material = sprite.material as THREE.SpriteMaterial;
    if (isHighlighted) {
      material.color.setHex(0xffffff);
      material.opacity = 1;
    } else {
      material.color.setHex(0x888888);
      material.opacity = 0.2;
    }
  };

  // Cached version
  const createNodeObjectCached = (node: Node): THREE.Sprite => {
    let sprite = nodeObjects.current.get(node);

    if (!sprite) {
      sprite = createNodeObject(node);
      nodeObjects.current.set(node, sprite);
    }

    if (sprite) {
      updateSpriteHighlight(sprite, highlightNodes.has(node));
    }

    return sprite;
  };

  return (
    <div className={`${className ?? ""}`}>
      <ForceGraph3D
        graphData={data}
        onNodeRightClick={expandGraph}
        onNodeClick={handleNodeClick}
        nodeAutoColorBy="id"
        linkAutoColorBy="target"
        linkColor={(link) => {
          if (highlightLinks.has(link)) {
            return link.color || "white";
          }
          return "rgba(0,0,0,0.5)";
        }}
        linkWidth={(link) => (highlightLinks.has(link) ? 1 : 0.1)}
        linkOpacity={(link) => (highlightLinks.has(link) ? 1 : 0.5)}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1} // put arrow at the target end
        nodeThreeObject={createNodeObjectCached}
        ref={fgRef}
        // d3AlphaDecay={0.02} // slower stabilization
        // d3VelocityDecay={0.2} // friction-like damping
        showNavInfo={false}
      />
    </div>
  );
}
