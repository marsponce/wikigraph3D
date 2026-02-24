import { toast } from "sonner";
import { RefObject } from "react";
import { ForceGraphMethods } from "react-force-graph-3d";
import type { GraphNode, GraphLink, GraphData } from "@/types";
import { downloadGraphJSON, downloadGraphModel } from "@/lib/graph";

type DownloadCardProps = {
  graphRef: RefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>;
  graphData: GraphData;
};
export default function DownloadCard({
  graphRef,
  graphData,
}: DownloadCardProps) {
  return (
    <>
      <div className="flex flex-col justify-center items-center h-full">
        <button
          type="button"
          className="flex-none m-3 p-3 w-80 text-lg pointer-events-auto rounded transition-colors duration-300 bg-gray-900 hover:bg-sky-600 active:bg-sky-100 text-white"
          onClick={() => downloadGraphJSON(graphData)}
        >
          Download as JSON
        </button>
        <button
          type="button"
          className="flex-none m-3 p-3 w-80 text-lg pointer-events-auto rounded transition-colors duration-300 bg-gray-900 hover:bg-sky-600 active:bg-sky-100 text-white"
          onClick={() => downloadGraphModel(graphRef)}
        >
          Download as GLB
        </button>
      </div>
    </>
  );
}
