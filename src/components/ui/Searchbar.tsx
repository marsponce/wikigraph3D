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

  const MAX_RESULTS = 15;

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
      <div className="searchbar">
        <Combobox
          value={selectedNode}
          onChange={setSelectedNode}
          onClose={() => setQuery("")}
        >
          <div className="relative">
            <ComboboxInput
              aria-label="Node"
              displayValue={(node) => node?.name ?? ""}
              placeholder="Select a node..."
              onChange={(e) => setQuery(e.target.value)}
              className="searchbar-input group"
            />
            <ComboboxButton className="searchbar-button group">
              <ChevronDownIcon className="searchbar-button-icon" />
            </ComboboxButton>
          </div>

          <ComboboxOptions
            anchor="bottom start"
            portal
            className="searchbar-results-container"
          >
            {filteredNodes.map((node) => (
              <ComboboxOption
                key={node.id}
                value={node}
                className={clsx(
                  "group searchbar-result",
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
                className="searchbar-result italic text-gray-400"
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
