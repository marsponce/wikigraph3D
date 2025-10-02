// /src/components/ui/Button.tsx
import { Button as HeadlessButton } from "@headlessui/react";
import clsx from "clsx";

const baseClasses =
  "pointer-events-auto size-7 rounded transition duration-300";

const variants = {
  sidebar: "bg-gray-800 text-white hover:bg-sky-500 active:bg-sky-700",
  primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
  secondary: "bg-gray-200 text-black hover:bg-gray-300 active:bg-gray-400",
};

export function Button({ variant = "primary", className, ...props }) {
  return (
    <HeadlessButton
      className={clsx(baseClasses, variants[variant], className)}
      {...props}
    />
  );
}
