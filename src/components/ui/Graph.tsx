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

function focusCameraOnNode(
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
    focusCameraOnNode(fgRef, selectedNode);
    HighlightNode(selectedNode);
  }, [selectedNode]);

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

  const nodeObjects = useRef(new Map<Node, THREE.Group>());

  const createNodeObject = (node) => {
    const sprite = createNodeSprite(node);
    const label = createNodeLabel(node, sprite.scale.y); // TODO: Use CSS2D label instead

    const isHighlighted = highlightNodes.has(node);

    if (isHighlighted) {
      (sprite.material as THREE.SpriteMaterial).color.setHex(0xffffff);
      (sprite.material as THREE.SpriteMaterial).opacity = 1;
      // label.color = node.color;
    } else {
      (sprite.material as THREE.SpriteMaterial).color.setHex(0x222222);
      (sprite.material as THREE.SpriteMaterial).opacity = 0.2;
      // label.color = 0x222222;
    }

    const group = new THREE.Group();
    group.add(sprite);
    // group.add(label);
    return group;
  };

  const createNodeObjectCached = (node) => {
    if (nodeObjects.current.has(node)) {
      const group = nodeObjects.current.get(node);
      const sprite = group.children[0] as THREE.Sprite;
      // const label = group.children[1] as SpriteText;
      const isHighlighted = highlightNodes.has(node);

      if (isHighlighted) {
        (sprite.material as THREE.SpriteMaterial).color.setHex(0xffffff);
        (sprite.material as THREE.SpriteMaterial).opacity = 1;
        // label.color = node.color;
      } else {
        (sprite.material as THREE.SpriteMaterial).color.setHex(0x222222);
        (sprite.material as THREE.SpriteMaterial).opacity = 0.2;
        // label.color = 0x222222;
      }
    } else {
      const group = createNodeObject(node);
      nodeObjects.current.set(node, group);
      return group;
    }
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
        linkWidth={(link) => {
          highlightLinks.has(link) ? 2 : 0.05;
        }}
        linkOpacity={(link) => {
          highlightLinks.has(link) ? 1 : 0.5;
        }}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1} // put arrow at the target end
        nodeThreeObject={createNodeObject}
        ref={fgRef}
        // d3AlphaDecay={0.02} // slower stabilization
        // d3VelocityDecay={0.2} // friction-like damping
        showNavInfo={false}
      />
    </div>
  );
}
