"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { ThemeSwitcher } from "./shadcn/ThemeSwitcher";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const theme = resolvedTheme as "dark" | "light" | "system";

  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-black/[.08] bg-[#242424] text-white">
      <div className="w-full flex gap-4 items-center justify-start md:justify-center">
        <div className="flex items-center gap-4 py-6 lg:py-8 text-2xl">
          Content Builder for LMS
        </div>
      </div>
      <p className="hidden sm:block sm:text-lg sm:mt-7 lg:mt-10 absolute right-4 top-0">
        Robin Sao 21905099
      </p>

      <hr />

      <nav className="flex-col md:flex-row flex h-auto items-center justify-between relative">
        <div
          className={cn(
            "flex [&>*]:hover:underline decoration-[var(--color-red-latrobe)] decoration-2 [&>*]:text-center",
            `[&>*]:px-4 md:[&>*]:px-8 [&>*]:py-4`,
          )}
        >
          <Link href="/tab-generator" className="flex items-center">
            Tabs
          </Link>
          <Link href="/pre-lab-questions">Pre-lab Questions</Link>
          <Link href="/escape-room">Escape Room</Link>
          <Link href="/coding-races">Coding Races</Link>
        </div>

        <hr className="w-full md:hidden" />

        <div className="flex h-14 md:h-full pr-2 items-center gap-4 lg:gap-6 relative">
          <div className="h-full flex items-center [&>*]:px-2 gap-4 md:gap-6">
            <span className="text-center">Theme</span>
            <ThemeSwitcher
              onChange={setTheme}
              value={theme}
              className="border-none bg-[var(--color-red-latrobe)] dark:bg-transparent scale-125 [&>*]:hover:cursor-pointer"
            />
          </div>
          <Link
            href="/about"
            className="h-full flex items-center justify-center hover:underline decoration-[var(--color-red-latrobe)] decoration-2 px-2"
          >
            About
          </Link>
          <HamburgerButton />
        </div>
      </nav>
    </header>
  );
}

function HamburgerButton() {
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popup on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [open]);
  return (
    <>
      <button
        ref={buttonRef}
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
        className={`h-full  flex items-center justify-center w-12 relative z-20 bg-transparent border-none outline-none transition-transform duration-300 ease-[cubic-bezier(.4,2,.6,1)] ${open ? "rotate-90" : ""}`}
        style={{ cursor: "pointer" }}
      >
        <span className="sr-only">Open menu</span>
        <FontAwesomeIcon
          icon={open ? faTimes : faBars}
          size="lg"
          className="transition-transform duration-300 ease-[cubic-bezier(.4,2,.6,1)]"
        />
      </button>
      {/* Popup */}
      {open && (
        <div
          ref={popupRef}
          className="absolute top-16 right-0 h-auto text-foreground bg-background dark:bg-[#444] shadow-lg border-1 rounded-2xl overflow-clip w-40 flex flex-col hover:[&>*]:cursor-pointer"
        >
          <button className="px-4 py-3 rounded hover:bg-foreground/15 text-left">
            Action 1
          </button>
          <button className="px-4 py-3 rounded hover:bg-foreground/15 text-left">
            Action 2
          </button>
        </div>
      )}
    </>
  );
}
