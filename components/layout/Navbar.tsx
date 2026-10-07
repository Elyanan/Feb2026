"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { navigation, site } from "@/config/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("#main");

  const sectionIds = useMemo(() => navigation.map((item) => item.href.slice(1)), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActive(`#${visible.target.id}`);
        }
      },
      { rootMargin: "-20% 0px -62% 0px", threshold: [0.1, 0.25, 0.5] }
    );

    sectionIds.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-[var(--line)] bg-[rgba(251,253,248,0.86)] shadow-[0_10px_40px_rgba(9,35,22,0.08)] backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link
          href="#main"
          className="group flex items-baseline gap-2 font-[var(--font-display)] text-[1.35rem] font-semibold tracking-normal"
          onClick={() => setOpen(false)}
        >
          <span>{site.name}</span>
          <span className="text-sm font-bold text-[var(--green-700)]">{site.year}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-semibold text-[var(--stone)] transition hover:text-[var(--foreground)]",
                active === item.href && "text-[var(--foreground)]"
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 bg-[var(--green-700)] transition",
                  active === item.href && "scale-x-100"
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link className="btn btn-primary hidden sm:inline-flex" href="#apply">
            Apply <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <button
            className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius)] border border-[var(--line)] bg-white/70 text-[var(--foreground)] lg:hidden"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        aria-hidden={!open}
        className={cn(
          "fixed inset-x-0 top-20 h-[calc(100svh-5rem)] origin-top overflow-hidden border-t border-[var(--line)] bg-[var(--paper)] px-5 transition lg:hidden",
          open ? "scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0"
        )}
      >
        <nav className="container flex h-full flex-col justify-between py-7" aria-label="Mobile navigation">
          <div className="grid gap-2">
            {navigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="group grid grid-cols-[3rem_1fr_auto] items-center border-b border-[var(--line)] py-5 text-left"
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
              >
                <span className="fine">0{index + 1}</span>
                <span className="font-[var(--font-display)] text-3xl">{item.label}</span>
                <ArrowRight className="transition group-hover:translate-x-1" size={20} aria-hidden="true" />
              </Link>
            ))}
          </div>
          <Link className="btn btn-primary w-full" href="#apply" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            Apply for the program
          </Link>
        </nav>
      </div>
    </header>
  );
}
