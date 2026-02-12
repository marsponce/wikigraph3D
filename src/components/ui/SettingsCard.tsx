import { toast } from "sonner";
import { RefObject } from "react";
import { ForceGraphMethods } from "react-force-graph-3d";
import type { GraphNode, GraphLink, GraphData } from "@/types";
import { downloadGraphJSON, downloadGraphModel } from "@/lib/graph";

type SettingsCardProps = {
  graphRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>;
};
export default function SettingsCard({ graphRef }: SettingsCardProps) {
  return (
    <>
      <div className="flex flex-col">
        <p>To Do: Implement Settings Card</p>
      </div>
    </>
  );
}
