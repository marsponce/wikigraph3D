// /src/components/ui/Button.tsx
import { Button as HeadlessButton } from "@headlessui/react";
import clsx from "clsx";

const baseClasses =
  "pointer-events-auto size-7 rounded transition-colors duration-300";

const variants = {
  sidebar: "bg-gray-800 text-white hover:bg-sky-600 active:bg-sky-100",
  primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
  secondary: "bg-gray-200 text-black hover:bg-gray-300 active:bg-gray-400",
};

const toggledVariants = {
  sidebar: "bg-sky-600",
  primary: "bg-blue-700 text-white",
  secondary: "bg-gray-300 text-black",
};

export function Button({
  variant = "primary",
  toggled = false,
  className,
  ...props
}) {
  return (
    <HeadlessButton
      className={clsx(
        baseClasses,
        variants[variant],
        toggled && toggledVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
