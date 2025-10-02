// src/app/components/Sidebar.tsx
import parse from "html-react-parser";
import he from "he";
import { useState } from "react";
import { Field } from "@base-ui-components/react/field";

type SearchbarProps = {
  className?: string;
  node: Node;
};

export default function Searchbar({ className, node }: SearchbarProps) {
  return (
    <>
      <div
        className={`
					absolute top-0 right-20
					bg-transparent shadow-lg z-60
					overflow-x-hidden
					w-100 min-h-full ${className ?? ""}
				`}
      >
        {/* text entry field */}
        <Field.Root className="">
          <Field.Label className="">Name</Field.Label>
          <Field.Control required placeholder="Required" className="" />

          <Field.Error className="" match="valueMissing">
            Please enter your name
          </Field.Error>

          <Field.Description className="">
            Visible on your profile
          </Field.Description>
        </Field.Root>
        {/* search button */}
        <button
          className={`
						pr-2 absolute top-2 right-0
						bg-red-800 text-white size-7 rounded z-61
					`}
          title="Search"
        >
          
        </button>
      </div>
    </>
  );
}
