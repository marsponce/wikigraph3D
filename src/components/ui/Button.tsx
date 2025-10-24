// /src/components/ui/Button.tsx
import { Button as HeadlessButton } from "@headlessui/react";
import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

interface ButtonProps extends ComponentPropsWithoutRef<typeof HeadlessButton> {
  toggled?: boolean;
}

export default function Button({
  toggled = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <HeadlessButton
      className={clsx("btn", className)}
      data-toggled={toggled ? "true" : "false"}
      {...props}
    />
  );
}
