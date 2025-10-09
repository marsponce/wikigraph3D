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
import { GraphData } from "@/lib/types";
import clsx from "clsx";

type SearchbarProps = {
  className?: string;
  graphData?: GraphData;
  selectedNode: Node;
  setSelectedNode: (node: Node) => void;
};

export default function Searchbar({
  className,
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

  const MAX_RESULTS = 16;

  const filteredNodes = useMemo(() => {
    return debouncedQuery === ""
      ? graphData.nodes.slice(0, MAX_RESULTS)
      : graphData.nodes
          .filter((node) => {
            return node.name
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase());
          })
          .slice(0, MAX_RESULTS);
  }, [graphData.nodes, debouncedQuery]);

  const totalMatchingNodes = useMemo(() => {
    return debouncedQuery === ""
      ? graphData.nodes.length
      : graphData.nodes.filter((node) =>
          node.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
        ).length;
  }, [graphData.nodes, debouncedQuery]);

  const hiddenCount = Math.max(0, totalMatchingNodes - MAX_RESULTS);

  return (
    <>
      <div className="relative w-auto z-50 mx-auto pr-10">
        <Combobox
          value={selectedNode}
          onChange={setSelectedNode}
          onClose={() => setQuery("")}
        >
          <div className="relative">
            <ComboboxInput
              aria-label="Node"
              displayValue={(node) => node?.name ?? "Select a node..."}
              onChange={(e) => setQuery(e.target.value)}
              className="group container rounded-lg border-none bg-black/100 py-2 px-2 text-2xl font-bold text-white hover:ring-3 hover:ring-white/25 focus:outline-none focus:ring-2 focus:ring-white/100"
            />
            <ComboboxButton className="group absolute inset-y-0 right-0 px-2">
              <ChevronDownIcon className="size-8 fill-white/0 group-data-hover:fill-white" />
            </ComboboxButton>
          </div>

          <ComboboxOptions
            anchor="bottom start"
            portal
            className={clsx(
              "container absolute h-(calc(100vh-1rem)) w-(--input-width)",
              "mt-1 rounded-lg ring-3 ring-white/15 bg-black/90 p-1 z-50",
            )}
          >
            {filteredNodes.map((node) => (
              <ComboboxOption
                key={node.id}
                value={node}
                className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-grey/100"
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
                className="flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none italic text-gray-400"
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
