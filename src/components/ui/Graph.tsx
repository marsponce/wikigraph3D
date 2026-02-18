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
  computeNodeDepths,
  depthToColor,
  getRootNode,
  resolveID,
} from "@/lib/graph";
import { todaysDate } from "@/lib/utils";
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
  edgeColorMode: "auto" | "depth";
  highlightDistance: number;
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
  edgeColorMode = "depth",
  highlightDistance = 4,
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

  // Highlight based on highlightDistance rather than direct neighbours only
  const [highlightedNodes, setHighlightedNodes] = useState<
    Map<GraphNode, number>
  >(new Map());
  const [highlightedLinks, setHighlightedLinks] = useState<
    Map<GraphLink, number>
  >(new Map());

  useEffect(() => {
    const nodes = new Map<GraphNode, number>();
    const links = new Map<GraphLink, number>();

    if (!selectedNode) {
      // everything should be visible
      data.nodes.forEach((node) => nodes.set(node, 0));
      data.links.forEach((link) => links.set(link, 0));
      setHighlightedNodes(nodes);
      setHighlightedLinks(links);
      return;
    }

    const depths = computeNodeDepths(selectedNode, data);
    data.nodes.forEach((node) => {
      if (node.id == null) return;
      const distance = depths.get(node.id) ?? Infinity;
      if (distance <= highlightDistance) {
        nodes.set(node, distance);
      }
    });

    data.links.forEach((link) => {
      const src = resolveID(link.source);
      const tgt = resolveID(link.target);
      if (src == null || tgt == null) return;

      const srcDepth = depths.get(src) ?? Infinity;
      const tgtDepth = depths.get(tgt) ?? Infinity;
      if (srcDepth <= highlightDistance && tgtDepth <= highlightDistance) {
        links.set(link, Math.min(srcDepth, tgtDepth));
      }
    });

    setHighlightedNodes(nodes);
    setHighlightedLinks(links);
  }, [selectedNode, data, highlightDistance]);

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
  }, [data]); // Only recalc when counts change

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
  const handleDagError = useCallback((loopNodeIds: (string | number)[]) => {
    console.warn("Cycle detected in graph:", loopNodeIds);
    toast.warning(
      `Graph contains a cycle involving ${loopNodeIds.length} nodes. DAG layout may be approximate.`,
      {
        duration: 5000,
      },
    );
  }, []);

  // Link & Node coloring
  const rootNode = useMemo(() => getRootNode(data, todaysDate()), [data]);

  const nodeDepths = useMemo(() => {
    if (edgeColorMode !== "depth" || !rootNode?.id) return new Map();
    return computeNodeDepths(rootNode.id, data);
  }, [edgeColorMode, rootNode, data]);

  const maxDepth = useMemo(
    () => Math.max(...Array.from(nodeDepths.values()), 1),
    [nodeDepths],
  );

  const getLinkColor = useCallback(
    (link: GraphLink): string => {
      if (edgeColorMode !== "depth" || nodeDepths.size === 0) return "#ffffff";
      const tgt =
        typeof link.target === "object"
          ? (link.target as GraphNode).id!
          : link.target;
      const depth = nodeDepths.get(tgt) ?? maxDepth;
      return depthToColor(depth, maxDepth);
    },
    [nodeDepths, maxDepth, edgeColorMode],
  );

  const getNodeColor = useCallback(
    (node: GraphNode): string => {
      if (edgeColorMode !== "depth" || nodeDepths.size === 0) return "#ffffff";
      if (node.id == null) return "#ffffff";
      const depth = nodeDepths.get(node.id) ?? maxDepth;
      return depthToColor(depth, maxDepth);
    },
    [nodeDepths, maxDepth, edgeColorMode],
  );

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
        nodeColor={edgeColorMode === "depth" ? getNodeColor : undefined}
        linkAutoColorBy="target"
        linkColor={edgeColorMode === "depth" ? getLinkColor : undefined}
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
