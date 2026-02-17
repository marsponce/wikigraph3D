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
  useMemo,
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
  getNodeDegree,
} from "@/lib/graph";
import type { ForceGraphMethods } from "react-force-graph-3d";
import { toast } from "sonner";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

export type GraphSettings = {
  nodeSize: number;
  enableDynamicNodeSizing: boolean;
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
  dagMode:
    | "td"
    | "bu"
    | "lr"
    | "rl"
    | "zout"
    | "zin"
    | "radialout"
    | "radialin"
    | null;
  dagLevelDistance?: number;
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
  showThumbnails = true,
  cooldownTicks = 100,
  enableNodeDrag = false,
  showNavInfo = true,
  darkMode = false,
  controlType = "trackball",
  dagMode = null,
  dagLevelDistance,
  enableDynamicNodeSizing = true,
}: GraphProps) {
  const loadInitialNode = useCallback(() => {
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
  }, [setDataAction]);

  // Get the graph from supabase if it exists
  useEffect(() => {
    const loadGraph = () => {
      // Slight delay before starting the fetch to ensure toast is shown
      setTimeout(() => {
        toast.promise(
          (async () => {
            // Fetch the graph from Supabase
            const { graph, nodesCount, linksCount } = await fetchGraph();

            if (nodesCount === 0) {
              console.log("Empty graph, fetching initial node");
              loadInitialNode();
            } else {
              console.log("Nodes: ", nodesCount, "Links: ", linksCount);
              setDataAction({ nodes: graph.nodes, links: graph.links });
            }

            return { nodesCount, linksCount };
          })(),
          {
            loading: "Loading Graph...", // This will show during the loading phase
            success: ({ nodesCount, linksCount }) =>
              `Graph Loaded with ${nodesCount} nodes and ${linksCount} links`, // Success message
            error: () => ({
              message: "Failed to fetch graph", // Error message if fetch fails
              duration: Infinity, // Keeps the error toast indefinitely
              action: {
                label: "Retry", // Retry button for error
                onClick: () => loadGraph(),
              },
            }),
          },
        );
      }, 50); // Delay toast for 50ms to allow it to render before the async operation
    };

    loadGraph();
  }, [setDataAction, loadInitialNode]);

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

  const handleEngineStop = () => {
    console.log("Engine stop");
  };

  const nodeObjects = useRef<Map<GraphNode, THREE.Sprite>>(new Map());

  const createNodeObject = (
    node: GraphNode,
    graphData: GraphData,
  ): THREE.Sprite => {
    let sprite;
    if (enableDynamicNodeSizing)
      sprite = createNodeSprite(node, graphData, handleNodeSizing(node));
    else sprite = createNodeSprite(node, graphData, 1);
    updateSpriteHighlight(sprite, highlightedNodes.has(node));
    return sprite;
  };

  const createNodeObjectCached = (node: GraphNode): THREE.Sprite => {
    let sprite = nodeObjects.current.get(node);
    if (!sprite) {
      sprite = createNodeObject(node, data);
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

  // Node sizing
  const MIN_SIZE_MULTIPLIER = 0.01;
  const MAX_SIZE_MULTIPLIER = 2;

  // Memoize degree calculations for all nodes
  const nodeDegrees = useMemo(() => {
    const degrees = new Map<string | number, number>();
    data.nodes.forEach((node) => {
      if (node.id == null) return;
      degrees.set(node.id, getNodeDegree(node, data));
    });
    return degrees;
  }, [data.nodes.length, data.links.length]); // Only recalc when counts change

  const maxDegree = useMemo(
    () => Math.max(...Array.from(nodeDegrees.values()), 1),
    [nodeDegrees],
  );

  const prevMaxDegree = useRef(maxDegree);

  useEffect(() => {
    if (prevMaxDegree.current !== maxDegree) {
      nodeObjects.current.clear();
      prevMaxDegree.current = maxDegree;
    }
  }, [maxDegree]);

  const handleNodeSizing = (node: GraphNode): number => {
    if (!enableDynamicNodeSizing) return nodeSize;
    if (!node.id) return nodeSize;
    const degree = Math.max(nodeDegrees.get(node.id) || 1, 1);
    const normalizedDegree = degree / maxDegree;
    const multiplier =
      MIN_SIZE_MULTIPLIER +
      normalizedDegree * (MAX_SIZE_MULTIPLIER - MIN_SIZE_MULTIPLIER);

    return nodeSize * multiplier;
  };

  // Clear the cache when we change the following settings
  useEffect(() => {
    nodeObjects.current.clear();
  }, [enableDynamicNodeSizing, nodeDegrees, nodeSize]);

  // dagMode
  const handleDagError = useCallback((loopNodeIds: string[]) => {
    console.warn("Cycle detected in graph:", loopNodeIds);
    toast.warning(
      `Graph contains a cycle involving ${loopNodeIds.length} nodes. DAG layout may be approximate.`,
      {
        duration: 5000,
      },
    );
  }, []);

  return (
    <div className="absolute inset-0">
      <ForceGraph3D
        ref={graphRef}
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
        nodeThreeObjectExtend={false}
        nodeVal={handleNodeSizing}
        nodeOpacity={nodeOpacity}
        nodeLabel={(node) => (showLabels ? node.name : "")}
        nodeThreeObject={showThumbnails ? createNodeObjectCached : undefined}
        showNavInfo={showNavInfo}
        controlType={controlType}
        cooldownTicks={cooldownTicks}
        onEngineStop={handleEngineStop}
        dagMode={dagMode || undefined}
        dagLevelDistance={dagLevelDistance || undefined}
        onDagError={handleDagError}
      />
    </div>
  );
}
