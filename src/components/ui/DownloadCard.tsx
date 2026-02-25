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
  const download = (type: "json" | "glb") => {
    setTimeout(() => {
      toast.promise(
        (async () => {
          // throw new Error("test error"); // for testing
          if (type === "json") downloadGraphJSON(graphData);
          else downloadGraphModel(graphRef);
        })(),
        {
          loading: "Downloading...",
          success: "Downloaded successfully",
          error: () => ({
            message: "Download Failed",
            duration: 5000,
            action: {
              label: "Retry",
              onClick: () => download(type),
            },
          }),
        },
      );
    }, 50);
  };

  return (
    <>
      <div className="flex flex-col justify-center h-full w-fit mx-auto">
        <button
          type="button"
          className="flex-none m-3 p-3 text-lg pointer-events-auto rounded transition-colors duration-300 bg-gray-900 hover:bg-sky-600 active:bg-sky-100 text-white"
          onClick={() => download("json")}
        >
          Download as JSON
        </button>
        <button
          type="button"
          className="flex-none m-3 p-3 text-lg pointer-events-auto rounded transition-colors duration-300 bg-gray-900 hover:bg-sky-600 active:bg-sky-100 text-white"
          onClick={() => download("glb")}
        >
          Download as GLB
        </button>
      </div>
    </>
  );
}
