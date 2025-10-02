// src/app/components/Sidebar.tsx
import parse from "html-react-parser";
import he from "he";
import { useState } from "react";

type SearchbarProps = {
  className?: string;
  node: Node;
};

export default function Searchbar({ className, node }: SearchbarProps) {
  return (
    <>
      <div
        className={`
					absolute top-0 left-0 width-screen
					${className ?? ""}
				`}
      >
        <div
          className={`absolute left-1/2 -translate-x-1/2
					`}
        >
          {/* text entry field */}
          {/* search button */}
          <button
            className={`
							pr-2 absolute top-2 right-2
							bg-red-800 text-white size-7 rounded z-61
						`}
            title="Search"
          >
            
          </button>
        </div>
      </div>
    </>
  );
}
