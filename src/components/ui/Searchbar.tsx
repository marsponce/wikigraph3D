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
                "w-full container rounded border-none",
                "bg-white/100 text-gray-900 ring-2 ring-gray-900/35 dark:bg-black/100 dark:text-white dark:ring-white/35",
                "hover:ring-gray-900 focus:ring-2 focus:ring-gray-900/100 p-2 dark:hover:ring-white dark:focus:ring-white/100",
                "text-2xl md:text-3xl font-bold",
                "group",
              )}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 group">
              <ChevronDownIcon className="size-8 fill-gray-900 dark:fill-white sm:group-data-hover:fill-gray-900 dark:sm:group-data-hover:fill-white" />
            </ComboboxButton>
          </div>

          <ComboboxOptions
            anchor="bottom start"
            portal
            className="container absolute overflow-hidden h-auto max-h-screen w-(--input-width) mt-1 rounded-lg ring-3 ring-gray-900/15 bg-white/90 p-1 z-3 dark:ring-white/15 dark:bg-black/90"
          >
            {filteredNodes.map((node) => (
              <ComboboxOption
                key={node.id}
                value={node}
                className={clsx(
                  "group flex cursor-default items-center gap-2 rounded px-3 py-1.5 select-none",
                  "data-focus:ring-2 data-focus:ring-gray-900 data-focus:ring-offset-0 dark:data-focus:ring-white",
                )}
              >
                <CheckIcon className="invisible size-4 fill-white group-data-selected:visible" />
                <div className="text-sm">{node.name}</div>
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
