"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import LogoMark from "./LogoMark";
import ConnectWallet from "./ConnectWallet";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/task", label: "Tasks" },
  { href: "/library", label: "Library" },
  { href: "/memory", label: "Memory" },
  { href: "/market", label: "Market" },
];

export default function Nav({ right }: { right?: ReactNode }) {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b hairline bg-void/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-5 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <LogoMark size={32} />
            <span className="font-display text-lg sm:text-xl text-parchment">
              Grimoire
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {LINKS.map((l) => {
              const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    active
                      ? "text-parchment bg-white/[0.06]"
                      : "text-ash hover:text-parchment"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {right}
          <ConnectWallet />
        </div>
      </div>

      {/* mobile nav row */}
      <nav className="sm:hidden flex items-center gap-1 overflow-x-auto px-4 pb-2">
        {LINKS.map((l) => {
          const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 rounded-lg px-3 py-1 text-xs transition ${
                active ? "text-parchment bg-white/[0.06]" : "text-ash"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
