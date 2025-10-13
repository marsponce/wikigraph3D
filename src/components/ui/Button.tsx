// /src/components/ui/Button.tsx
import { Button as HeadlessButton } from "@headlessui/react";
import clsx from "clsx";

export default function Button({ toggled = false, className, ...props }) {
  return (
    <HeadlessButton
      className={clsx("btn", className)}
      data-toggled={toggled ? "true" : "false"}
      {...props}
    />
  );
}
