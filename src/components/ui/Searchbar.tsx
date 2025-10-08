// src/app/components/ui/Searchbar.tsx
import { useState } from "react";
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
};

export default function Searchbar({ className, graphData }: SearchbarProps) {
  const [selectedNode, setSelectedNode] = useState(graphData[0]);
  const [query, setQuery] = useState("");

  const filteredNodes =
    query === ""
      ? graphData
      : graphData.filter((node) => {
          return node.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <>
      <div className="relative w-auto z-50 mx-12">
        <Combobox
          value={selectedNode}
          onChange={setSelectedNode}
          onClose={() => setQuery("")}
        >
          <div className="relative">
            <ComboboxInput
              aria-label="Node"
              displayValue={(node) => node?.name ?? "Select a node.."}
              onChange={(e) => setQuery(e.target.value)}
              className="container rounded-lg border-none bg-black/100 py-1.5 pr-8 pl-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/25"
            />
            <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
              <ChevronDownIcon className="size-4 fill-white/60 group-data-hover:fill-white" />
            </ComboboxButton>
          </div>

          <ComboboxOptions
            anchor="bottom start"
            portal
            className="container fixed w-(--input-width) mt-1 rounded-xl border border-white/5 bg-black/90 p-1 max-h-60 overflow-auto z-50"
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
          </ComboboxOptions>
        </Combobox>
      </div>
    </>
  );
}
