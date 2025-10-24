"use client";

import clsx from "clsx";
import dynamic from "next/dynamic";
import {
  useEffect,
  useCallback,
  useRef,
  Dispatch,
  SetStateAction,
  RefObject,
} from "react";
import * as THREE from "three";
import { GraphNode, GraphLink, GraphData } from "@/types";
import {
  fetchInitialNode,
  fetchLinkedNodes,
  mergeGraphData,
  createNodeSprite,
  focusCameraOnNode,
} from "@/lib/graph";
import type { ForceGraphMethods } from "react-force-graph-3d";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

type GraphProps = {
  className?: string;
  graphRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>;
  selectedNode: GraphNode | null;
  setSelectedNodeAction: (node: GraphNode) => void;
  data: GraphData;
  setDataAction: Dispatch<SetStateAction<GraphData>>;
  isFocused: boolean;
};

export default function Graph({
  className,
  graphRef,
  selectedNode,
  setSelectedNodeAction,
  data,
  setDataAction,
  isFocused,
}: GraphProps) {
  useEffect(() => {
    (async () => {
      const root = await fetchInitialNode();
      setDataAction({ nodes: [{ ...root }], links: [] });
    })();
  }, [setDataAction]);

  const expandGraph = useCallback(
    async (node: GraphNode, event?: MouseEvent) => {
      event?.preventDefault?.();
      const newNodes = await fetchLinkedNodes(node);
      setDataAction((oldData) => mergeGraphData(node, newNodes, oldData));
    },
    [setDataAction],
  );

  const handleNodeClick = useCallback(
    (node: GraphNode, event?: MouseEvent) => {
      event?.preventDefault?.();
      setSelectedNodeAction(node);
    },
    [setSelectedNodeAction],
  );

  useEffect(() => {
    if (isFocused) {
      focusCameraOnNode(graphRef, selectedNode, data);
    }
  }, [selectedNode, graphRef, data, isFocused]);

  const nodeObjects = useRef<Map<GraphNode, THREE.Sprite>>(new Map());

  const createNodeObject = (node: GraphNode): THREE.Sprite => {
    const sprite = createNodeSprite(node);
    return sprite;
  };

  const createNodeObjectCached = (node: GraphNode): THREE.Sprite => {
    let sprite = nodeObjects.current.get(node);
    if (!sprite) {
      sprite = createNodeObject(node);
      nodeObjects.current.set(node, sprite);
    }
    return sprite;
  };

  return (
    <div className={clsx(className ?? "")}>
      <ForceGraph3D
        ref={graphRef}
        graphData={data}
        onNodeClick={handleNodeClick}
        // TODO: Replace with the article expansion method: onNodeRightClick={expandGraph}
        onNodeRightClick={expandGraph}
        nodeAutoColorBy="id"
        linkAutoColorBy="target"
        // linkColor={(link) => highlightLinks.has(link) ? "white" : "rgba(0,0,0,0.5)"}
        // TODO: FIX THIS linkWidth={(link) => (highlightLinks.has(link) ? 1 : 0.1) as number}
        // linkOpacity={(link) => (highlightLinks.has(link) ? 1 : 0.5)}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        nodeThreeObjectExtend={false}
        nodeThreeObject={createNodeObjectCached}
        showNavInfo={false}
      />
    </div>
  );
}
