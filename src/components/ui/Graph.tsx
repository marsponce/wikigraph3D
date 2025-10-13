"use client";

import clsx from "clsx";
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
import { Node, graphData } from "@/lib/types";
import {
  fetchInitialNode,
  fetchLinkedNodes,
  mergeGraphData,
  createNodeSprite,
  focusCameraOnNode,
  focusCameraOnGraph,
} from "@/lib/graph";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

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
      resetCamera: () => focusCameraOnGraph(fgRef, data),
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

      focusCameraOnNode(fgRef, selectedNode, data);
      HighlightNode(selectedNode);
    }, [selectedNode, data]);

    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());

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
      <div className={clsx(className ?? "")}>
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
