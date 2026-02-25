import type { GraphData, GraphNode, GraphLink } from "@/types";
import type { GraphStats } from "@/lib/graph";
import { computeGraphStats } from "@/lib/graph";
import { useMemo, RefObject } from "react";
import { WIKIPEDIA_ICON_URL } from "@/lib/constants";
import Image from "next/image";
import { focusCameraOnNode } from "@/lib/graph";
import type { ForceGraphMethods } from "react-force-graph-3d";

type StatsCardProps = {
  graphRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>;
  graphData: GraphData;
  setSelectedNode: (node: GraphNode | null) => void;
  setIsFocused: (isFocused: boolean) => void;
};

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-700 last:border-0">
      <span className="text-sm text-white">{label}</span>
      <span className="text-sm text-white font-mono">{value}</span>
    </div>
  );
}

export default function StatsCard({
  graphRef,
  graphData,
  setSelectedNode,
  setIsFocused,
}: StatsCardProps) {
  const stats: GraphStats = useMemo(
    () => computeGraphStats(graphData),
    [graphData.nodes.length, graphData.links.length],
  );

  return (
    <div className="flex flex-col gap-6 p-4 overflow-y-auto">
      {/* Graph Overview */}
      <div className="space-y-1">
        <h3 className="text-lg">Graph Overview</h3>
        <div className="dark:bg-gray-800 bg-gray-400 rounded-lg p-3">
          <StatRow label="Nodes" value={stats.nodeCount} />
          <StatRow label="Links" value={stats.linkCount} />
          <StatRow label="Avg. Degree" value={stats.averageDegree.toFixed(2)} />
          <StatRow label="Max Degree" value={stats.maxDegree} />
          <StatRow label="Diameter" value={stats.diameter} />
          <StatRow
            label="Avg. Path Length"
            value={stats.averagePathLength.toFixed(2)}
          />
        </div>
      </div>

      {/* Most Connected Nodes */}
      <div className="space-y-2">
        <h3 className="text-lg">Most Connected</h3>
        <div className="dark:bg-gray-800 bg-gray-400 rounded-lg divide-y divide-gray-300 dark:divide-gray-700 overflow-hidden">
          {stats.maxDegreeNodes.map((node, i) => (
            <div
              key={node.id}
              className="flex items-center gap-3 p-2 cursor-pointer hover:bg-sky-600 active:bg-sky-100"
              onClick={() => {
                setSelectedNode(node);
                focusCameraOnNode(graphRef, node, graphData);
                setIsFocused(true);
              }}
            >
              {/* Rank badge */}
              <span className="text-xs text-white font-mono w-5 text-right">
                {i + 1}
              </span>
              {/* Thumbnail */}
              <Image
                src={node.thumbnail?.source ?? WIKIPEDIA_ICON_URL}
                alt={node.name || ""}
                width={32}
                height={32}
                className="w-8 h-8 rounded object-cover flex-shrink-0"
                onError={(event) => {
                  if (event.currentTarget.src !== WIKIPEDIA_ICON_URL) {
                    event.currentTarget.src = WIKIPEDIA_ICON_URL;
                  }
                }}
              />
              {/* Name + degree bar */}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm text-gray-200 truncate">
                  {node.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{
                        width: `${((stats.degrees.get(node.id!) ?? 0) / stats.maxDegree) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-mono w-6 text-right">
                    {stats.degrees.get(node.id!) ?? 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
