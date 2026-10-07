"use client";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";

export function ApplicationSuccess({ name }: { name: string }) {
  const reduced = useReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: "center", behavior: "instant" }); }, []);
  const reveal = (delay: number) => ({ initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: reduced ? 0 : delay, duration: reduced ? 0 : 0.5 } });
  return (
    <motion.div className="mx-auto mt-12 max-w-2xl border-y border-[var(--line)] py-12 text-center" {...reveal(0)}>
      <div className="relative mx-auto h-36 w-36" aria-hidden="true">
        <svg viewBox="0 0 144 144" className="h-full w-full fill-none text-[var(--green-700)]">
          <motion.circle cx="72" cy="72" r="48" stroke="currentColor" strokeWidth="1.5" initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.15 }} />
          <motion.path d="M51 73 L66 87 L94 58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: reduced ? 0 : 0.8, duration: reduced ? 0 : 0.4 }} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => <motion.path key={angle} d="M72 12 L72 5" transform={`rotate(${angle} 72 72)`} stroke="currentColor" strokeWidth="1.5" initial={{ opacity: 0 }} animate={{ opacity: reduced ? 0.4 : [0, 0.7, 0.3] }} transition={{ delay: reduced ? 0 : 1.1, duration: reduced ? 0 : 0.7 }} />)}
        </svg>
      </div>
      <motion.h3 ref={heading} tabIndex={-1} className="h2 mt-6 outline-none" {...reveal(1.3)}>Application received</motion.h3>
      <motion.p className="lead mt-4" {...reveal(1.6)}>You are officially on our list.</motion.p>
      <motion.div className="mx-auto mt-8 max-w-md border border-[var(--line)] bg-white/75 p-6 text-left" {...reveal(1.9)}>
        <div className="flex items-center justify-between gap-4"><p className="eyebrow">FEB 2026</p><ArrowUpRight size={18} className="text-[var(--green-700)]" aria-hidden="true" /></div>
        <p className="mt-4 break-words text-xl font-semibold">Thank you, {name.split(/\s+/)[0]}.</p>
        <p className="mt-2 text-sm font-semibold text-[var(--green-700)]">Status: Application received</p>
        <p className="fine mt-4">We will contact you with next steps and program details. Keep an eye on your email.</p>
      </motion.div>
    </motion.div>
  );
}
