// src/app/components/Footer.tsx
import { version, name } from "../../../package.json";

export default function Footer() {
  return (
    <footer className="absolute bottom-0 left-0 w-full pointer-events-none">
      <h6 className="relative">
        <span className="absolute left-4 bottom-4">
          {name} {version}
        </span>
      </h6>
    </footer>
  );
}
