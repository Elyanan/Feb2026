"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useMemo } from "react";

type Point = {
  x: number;
  y: number;
};

function seededPoints() {
  const points: Point[] = [];
  let seed = 9;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  let y = 430;
  for (let x = 0; x <= 1200; x += 36) {
    y = Math.max(108, Math.min(542, y - 8 + (next() - 0.41) * 44));
    points.push({ x, y: Math.round(y) });
  }
  return points;
}

export function MarketBackground() {
  const reduceMotion = useReducedMotion();
  const points = useMemo(() => seededPoints(), []);
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  const area = `${path} L1200 640 L0 640 Z`;
  const finalPoint = points[points.length - 1];

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30 md:opacity-45" aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 1200 680" preserveAspectRatio="none">
        <defs>
          <linearGradient id="market-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#0d6f3d" stopOpacity="0.1" />
            <stop offset="55%" stopColor="#17a85a" />
            <stop offset="100%" stopColor="#b8e06c" />
          </linearGradient>
          <linearGradient id="market-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#17a85a" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#17a85a" stopOpacity="0" />
          </linearGradient>
          <pattern id="market-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M80 0H0V80" fill="none" stroke="#092316" strokeOpacity="0.065" />
          </pattern>
        </defs>
        <rect width="1200" height="680" fill="url(#market-grid)" />
        <path d={area} fill="url(#market-fill)" />
        <motion.path
          d={path}
          fill="none"
          stroke="url(#market-line)"
          strokeLinecap="round"
          strokeWidth="3"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 2.8, ease: [0.16, 1, 0.3, 1], delay: reduceMotion ? 0 : 0.75 }}
        />
        <motion.circle
          cx={finalPoint.x}
          cy={finalPoint.y}
          r="8"
          fill="#17a85a"
          initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
          animate={reduceMotion ? { scale: 1, opacity: 1 } : { scale: [1, 1.35, 1], opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 2.2, delay: reduceMotion ? 0 : 2.3, repeat: reduceMotion ? 0 : Infinity, repeatDelay: 1.8 }}
        />
      </svg>
    </div>
  );
}
