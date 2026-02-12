import { toast } from "sonner";
import type { GraphNode, GraphLink, GraphData } from "@/types";
import { downloadGraphJSON, downloadGraphModel } from "@/lib/graph";

type StatsCardProps = {
  graphData: GraphData;
};
export default function StatsCard({ graphData }: StatsCardProps) {
  return (
    <>
      <div className="flex flex-col">
        <p>Todo: Implement StatsCard</p>
      </div>
    </>
  );
}
