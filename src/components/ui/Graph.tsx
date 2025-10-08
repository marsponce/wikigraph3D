"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useRef } from "react";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import TWEEN from "@tweenjs/tween.js";
import { WIKIPEDIA_ICON_URL } from "@/lib/constants";
import { Node, Link, GraphData } from "@/lib/types";
import { API } from "@/lib/constants";
import { fetchInitialNode, fetchLinkedNodes, fetchNodeInfo } from "@/lib/graph";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

function handleNodeClick(node: Node) {}

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

function createNodeObject(node: Node, hoverNode: Node): THREE.Sprite {
  const texture = new THREE.TextureLoader().load(
    node.thumbnail?.source || WIKIPEDIA_ICON_URL,
  );
  const material = new THREE.SpriteMaterial({ map: texture });
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

  // Text Label
  const label = new SpriteText(node.name || node.id);
  label.material.depthWrite = false; // background transparent
  label.color = node.color;
  label.textHeight = 2;

  // Position the label above the image
  label.position.set(0, height / 2, 0);

  const group = new THREE.Group();
  group.add(sprite);
  group.add(label);

  return group;
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
      setSelectedNode(root);
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
    if (!selectedNode || !fgRef.current) return;

    const distance = 100;
    const hypot = Math.hypot(selectedNode.x, selectedNode.y, selectedNode.z);
    if (hypot == 0) {
      fgRef.current.cameraPosition(
        {
          x: selectedNode.x,
          y: selectedNode.y,
          z: selectedNode.z + distance + 1,
        },
        selectedNode,
        3000,
      );
    } else {
      const distRatio =
        1 +
        distance / Math.hypot(selectedNode.x, selectedNode.y, selectedNode.z);
      fgRef.current.cameraPosition(
        {
          x: selectedNode.x * distRatio,
          y: selectedNode.y * distRatio,
          z: selectedNode.z * distRatio,
        },
        selectedNode,
        3000,
      );
    }
  }, [selectedNode]);

  return (
    <div className={`${className ?? ""}`}>
      <ForceGraph3D
        graphData={data}
        onNodeRightClick={expandGraph}
        onNodeClick={handleNodeClick}
        nodeAutoColorBy="id"
        linkAutoColorBy="target"
        // linkWidth={1}
        linkOpacity={1}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1} // put arrow at the target end
        // onNodeHover={(node) => setHoverNode(node as Node | null)}
        nodeThreeObject={createNodeObject}
        ref={fgRef}
        d3AlphaDecay={0.02} // slower stabilization
        d3VelocityDecay={0.2} // friction-like damping
        showNavInfo={false}
      />
    </div>
  );
}
