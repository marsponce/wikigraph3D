import type { GraphData } from "@/types";
import type { GraphStats } from "@/lib/graph";
import { computeGraphStats } from "@/lib/graph";
import { useMemo } from "react";
import Image from "next/image";

type StatsCardProps = {
  graphData: GraphData;
};

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-white font-mono">{value}</span>
    </div>
  );
}

export default function StatsCard({ graphData }: StatsCardProps) {
  const stats: GraphStats = useMemo(
    () => computeGraphStats(graphData),
    [graphData.nodes.length, graphData.links.length],
  );

  return (
    <div className="flex flex-col gap-6 p-4 overflow-y-auto">
      {/* Graph Overview */}
      <div className="space-y-1">
        <h3 className="text-lg text-white">Graph Overview</h3>
        <div className="bg-gray-800 rounded-lg p-3">
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
        <h3 className="text-lg text-white">Most Connected</h3>
        <div className="bg-gray-800 rounded-lg divide-y divide-gray-700">
          {stats.maxDegreeNodes.map((node, i) => (
            <div key={node.id} className="flex items-center gap-3 p-2">
              {/* Rank badge */}
              <span className="text-xs text-gray-500 font-mono w-5 text-right">
                {i + 1}
              </span>
              {/* Thumbnail */}
              {node.thumbnail?.source && (
                <Image
                  src={node.thumbnail.source}
                  alt={node.name || ""}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                />
              )}
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
