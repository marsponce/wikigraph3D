"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useCallback,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
  RefObject,
} from "react";
import * as THREE from "three";
import { GraphNode, GraphLink, GraphData } from "@/types";
import {
  fetchInitialNode,
  fetchGraph,
  createNodeSprite,
  focusCameraOnNode,
  zoomToFit,
  updateSpriteHighlight,
} from "@/lib/graph";
import type { ForceGraphMethods } from "react-force-graph-3d";
import { toast } from "sonner";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

export type GraphSettings = {
  nodeSize: number;
  nodeOpacity: number;
  linkWidth: number;
  linkOpacity: number;
  showLabels: boolean;
  showThumbnails: boolean;
  cooldownTicks: number;
  enableNodeDrag: boolean;
  showNavInfo: boolean;
  darkMode: boolean;
  controlType: "trackball" | "orbit" | "fly";
};

type GraphProps = GraphSettings & {
  graphRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>;
  selectedNode: GraphNode | null;
  setSelectedNodeAction: (node: GraphNode | null) => void;
  data: GraphData;
  setDataAction: Dispatch<SetStateAction<GraphData>>;
  isFocused: boolean;
};

export default function Graph({
  graphRef,
  selectedNode,
  setSelectedNodeAction,
  data,
  setDataAction,
  isFocused,
  // Settings
  nodeSize = 1,
  nodeOpacity = 0,
  linkWidth = 1,
  linkOpacity = 1,
  showLabels = true,
  cooldownTicks = 100,
  enableNodeDrag = false,
  showNavInfo = true,
  darkMode = false,
  controlType = "trackball",
}: GraphProps) {
  const loadInitialNode = () => {
    fetchInitialNode()
      .then((root) => {
        // throw new Error("Test error"); // for testing
        console.log(root);
        setDataAction({ nodes: [{ ...root }], links: [] });
      })
      .catch((e) => {
        console.error("Failed to fetch initial node:", e);
        toast.error("Failed to fetch initial node", {
          duration: Infinity,
          action: {
            label: "Retry",
            onClick: () => loadInitialNode(),
          },
        });
      });
  };

  // Get the graph from supabase if it exists
  useEffect(() => {
    const loadGraph = () => {
      const graphPromise = fetchGraph().then(
        ({ graph, nodesCount, linksCount }) => {
          // throw new Error("test error"); // for testing
          if (nodesCount === 0) {
            console.log("Empty graph, fetching initial node");
            loadInitialNode();
          } else {
            console.log("Nodes: ", nodesCount, "Links: ", linksCount);
            setDataAction({ nodes: graph.nodes, links: graph.links });
          }
          return { nodesCount, linksCount };
        },
      );

      toast.promise(graphPromise, {
        loading: "Loading Graph...",
        success: ({ nodesCount, linksCount }) =>
          `Graph Loaded with ${nodesCount} nodes and ${linksCount} links`,
        error: () => ({
          message: "Failed to fetch graph",
          duration: Infinity,
          action: {
            label: "Retry",
            onClick: () => loadGraph(),
          },
        }),
      });
    };

    loadGraph();
  }, [setDataAction]);

  const handleNodeClick = useCallback(
    (node: GraphNode, event?: MouseEvent) => {
      event?.preventDefault?.();
      setSelectedNodeAction(node);
      console.log(node);
    },
    [setSelectedNodeAction],
  );

  const handleBackgroundClick = useCallback(
    (event?: MouseEvent) => {
      event?.preventDefault?.();
      setSelectedNodeAction(null);
    },
    [setSelectedNodeAction],
  );

  // Auto focus camera
  const handleEngineStop = () => {
    if (isFocused) {
      focusCameraOnNode(graphRef, selectedNode, data);
    } else {
      zoomToFit(graphRef);
    }
  };

  const nodeObjects = useRef<Map<GraphNode, THREE.Sprite>>(new Map());

  const createNodeObject = (node: GraphNode): THREE.Sprite => {
    const sprite = createNodeSprite(node);
    updateSpriteHighlight(sprite, highlightedNodes.has(node));
    return sprite;
  };

  const createNodeObjectCached = (node: GraphNode): THREE.Sprite => {
    let sprite = nodeObjects.current.get(node);
    if (!sprite) {
      sprite = createNodeObject(node);
      nodeObjects.current.set(node, sprite);
    }
    if (sprite) {
      updateSpriteHighlight(sprite, highlightedNodes.has(node));
    }
    return sprite;
  };

  const [highlightedNodes, setHighlightedNodes] = useState<Set<GraphNode>>(
    new Set(),
  );
  const [highlightedLinks, setHighlightedLinks] = useState<Set<GraphLink>>(
    new Set(),
  );
  // highlight selected Node, or highlight everything
  useEffect(() => {
    const HighlightNode = (
      node: GraphNode | null,
      nodes: Set<GraphNode>,
      links: Set<GraphLink>,
    ) => {
      if (!node) return;
      nodes.add(node);
      data.links.forEach((link) => {
        if (link.source === node || link.source === node.id) {
          links.add(link);
          nodes.add(link.target as GraphNode);
        } else if (link.target === node || link.target === node.id) {
          links.add(link);
          nodes.add(link.source as GraphNode);
        }
      });
      setHighlightedNodes(nodes);
      setHighlightedLinks(links);
    };
    const nodes = new Set<GraphNode>();
    const links = new Set<GraphLink>();
    if (selectedNode) {
      HighlightNode(selectedNode, nodes, links);
    } else {
      data.nodes.forEach((node) => {
        HighlightNode(node, nodes, links);
      });
    }
  }, [selectedNode, data, setSelectedNodeAction]);

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Dynamically resize the graph if we need to (screen rotations, resizes, etc.)
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("orientationchange", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("orientationchange", updateDimensions);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <ForceGraph3D
        ref={graphRef}
        // width={dimensions.squareSize}
        // height={dimensions.squareSize}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        enableNodeDrag={enableNodeDrag}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
        nodeAutoColorBy="id"
        linkAutoColorBy="target"
        linkVisibility={(link) => highlightedLinks.has(link)}
        linkWidth={linkWidth}
        linkOpacity={linkOpacity}
        nodeThreeObjectExtend={true}
        nodeRelSize={nodeSize}
        nodeOpacity={nodeOpacity}
        nodeLabel={(node) => (showLabels ? node.name : "")}
        nodeThreeObject={createNodeObjectCached}
        showNavInfo={showNavInfo}
        controlType={controlType}
        cooldownTicks={cooldownTicks}
        onEngineStop={handleEngineStop}
      />
    </div>
  );
}
