"use client";

import { useInView } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);
  const visibleValue = reduceMotion ? value : displayValue;

  useEffect(() => {
    if (!isInView || reduceMotion) return;

    let frame = 0;
    const frames = 28;
    const interval = window.setInterval(() => {
      frame += 1;
      setDisplayValue(Math.min(value, Math.round((frame / frames) * value)));
      if (frame >= frames) window.clearInterval(interval);
    }, 32);

    return () => window.clearInterval(interval);
  }, [isInView, reduceMotion, value]);

  return (
    <span ref={ref} className="font-[var(--font-display)] text-6xl leading-none text-[var(--green-700)]">
      {visibleValue}
    </span>
  );
}
