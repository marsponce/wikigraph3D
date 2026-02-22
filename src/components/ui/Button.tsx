// /src/components/ui/Button.tsx
import { Button as HeadlessButton } from "@headlessui/react";
import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

interface ButtonProps extends ComponentPropsWithoutRef<typeof HeadlessButton> {
  toggled?: boolean;
  title?: string;
  className?: string;
}

export default function Button({
  toggled = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <HeadlessButton
      className={clsx(
        "pointer-events-auto size-10 sm:size-7 rounded transition-colors duration-300",
        "bg-gray-900 hover:bg-sky-600 active:bg-sky-100",
        "data-[toggled=true]:bg-sky-600",
        "data-disabled:opacity-40 data-disabled:cursor-not-allowed data-disabled:hover:bg-gray-900 data-disabled:pointer-events-none",
        className,
      )}
      data-toggled={toggled ? "true" : "false"}
      {...props}
    />
  );
}
