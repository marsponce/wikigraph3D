"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import { Node, Link, graphData } from "@/lib/types";
import {
  fetchInitialNode,
  fetchLinkedNodes,
  fetchNodeInfo,
  mergeGraphData,
  createNodeSprite,
  getGraphCenter,
  getGraphRadius,
} from "@/lib/graph";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

// Focus the camera on a node
function focusCameraOnNode(fgRef, selectedNode: Node, data: graphData) {
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
function resetGraphView(fgRef, data: graphData) {
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

export type GraphHandle = {
  resetCamera: () => void;
};

type GraphProps = {
  className?: string;
  selectedNode: Node;
  setSelectedNode: (node: Node) => void;
  data: graphData;
  setData: (graphData: graphData) => void;
};

const Graph = forwardRef<GraphHandle, GraphProps>(
  ({ className, selectedNode, setSelectedNode, data, setData }, ref) => {
    const fgRef = useRef(null);

    // expose public methods to parent
    useImperativeHandle(ref, () => ({
      resetCamera: () => resetGraphView(fgRef, data),
    }));

    useEffect(() => {
      (async () => {
        const root = await fetchInitialNode();
        setData({ nodes: [{ ...root }], links: [] });
        // setSelectedNode(root); TODO: Fix camera not focusing on this bug.
      })();
    }, [setData]);

    const expandGraph = useCallback(
      async (node) => {
        const newNodes = await fetchLinkedNodes(node);
        const CHUNK_SIZE = 16;
        const DELAY_MS = 1000;

        const nodeChunks: Node[][] = [];
        for (let i = 0; i < newNodes.length; i += CHUNK_SIZE) {
          nodeChunks.push(newNodes.slice(i, i + CHUNK_SIZE));
        }

        nodeChunks.forEach((chunk, idx) => {
          setTimeout(() => {
            setData((oldData) => mergeGraphData(node, chunk, oldData));
          }, idx * DELAY_MS);
        });
      },
      [setData],
    );

    const handleNodeClick = async (node: Node) => {
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
      updateSpriteHighlight(sprite, highlightNodes.has(node));
      return sprite;
    };

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
          ref={fgRef}
          graphData={data}
          onNodeRightClick={expandGraph}
          onNodeClick={handleNodeClick}
          nodeAutoColorBy="id"
          linkAutoColorBy="target"
          linkColor={(link) =>
            highlightLinks.has(link) ? "white" : "rgba(0,0,0,0.5)"
          }
          linkWidth={(link) => (highlightLinks.has(link) ? 1 : 0.1)}
          linkOpacity={(link) => (highlightLinks.has(link) ? 1 : 0.5)}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          nodeThreeObject={createNodeObjectCached}
          showNavInfo={false}
        />
      </div>
    );
  },
);

Graph.displayName = "Graph";
export default Graph;
