// src/app/components/ui/Searchbar.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  ComboboxButton,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { GraphData, GraphNode } from "@/types";
import clsx from "clsx";

type SearchbarProps = {
  graphData: GraphData;
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
};

export default function Searchbar({
  graphData,
  selectedNode,
  setSelectedNode,
}: SearchbarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const MAX_RESULTS = 15;

  const filteredNodes = useMemo(() => {
    return debouncedQuery === ""
      ? graphData.nodes.slice(0, MAX_RESULTS)
      : graphData.nodes
          .filter((node) => {
            return node.name
              ?.toLowerCase()
              .includes(debouncedQuery.toLowerCase());
          })
          .slice(0, MAX_RESULTS);
  }, [graphData.nodes, debouncedQuery]);

  const totalMatchingNodes = useMemo(() => {
    return debouncedQuery === ""
      ? graphData.nodes.length
      : graphData.nodes.filter((node) =>
          node.name?.toLowerCase().includes(debouncedQuery.toLowerCase()),
        ).length;
  }, [graphData.nodes, debouncedQuery]);

  const hiddenCount = Math.max(0, totalMatchingNodes - MAX_RESULTS);

  return (
    <>
      <div className="relative z-50 sticky top-0">
        <Combobox
          value={selectedNode}
          onChange={setSelectedNode}
          onClose={() => setQuery("")}
        >
          <div className="relative">
            <ComboboxInput
              aria-label="Node"
              displayValue={(node: GraphNode) => node?.name ?? ""}
              placeholder="..."
              onChange={(e) => setQuery(e.target.value)}
              className={clsx(
                "w-full container rounded border-none bg-black/100",
                "text-2xl md:text-3xl font-bold text-white ring-2 ring-white/25",
                "hover:ring-white focus:ring-2 focus:ring-white/100 p-2",
                "group",
              )}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 group">
              <ChevronDownIcon className="size-8 fill-white sm:fill-white/0 sm:group-data-hover:fill-white" />
            </ComboboxButton>
          </div>

          <ComboboxOptions
            anchor="bottom start"
            portal
            className="container absolute overflow-hidden h-auto max-h-screen w-(--input-width) mt-1 rounded-lg ring-3 ring-white/15 bg-black/90 p-1 z-3"
          >
            {filteredNodes.map((node) => (
              <ComboboxOption
                key={node.id}
                value={node}
                className={clsx(
                  "group flex cursor-default items-center gap-2 rounded px-3 py-1.5 select-none",
                  "data-focus:ring-2 data-focus:right-white data-focus:ring-offset-0",
                )}
              >
                <CheckIcon className="invisible size-4 fill-white group-data-selected:visible" />
                <div className="text-sm text-white">{node.name}</div>
              </ComboboxOption>
            ))}
            {hiddenCount > 0 && (
              <ComboboxOption
                key="hidden-count"
                value={{ id: "hidden-count" }}
                disabled
                className="italic text-gray-400 flex cursor-default items-center gap-2 rounded px-3 py-1.5 select-none"
              >
                ... ({hiddenCount} more{" "}
                {hiddenCount === 1 ? "result" : "results"} hidden)
              </ComboboxOption>
            )}
          </ComboboxOptions>
        </Combobox>
      </div>
    </>
  );
}
