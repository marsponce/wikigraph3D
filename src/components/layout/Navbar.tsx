"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav>
      Navbar
      <ul>
        {links.map(({ href, label }) => {
          const isActive = pathname === href;

          return (
            <li key={label}>
              <Link
                key={href}
                href={href}
                className={`hover:underline ${isActive ? "font-bold" : ""}`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
