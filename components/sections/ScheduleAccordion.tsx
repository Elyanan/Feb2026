"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useState } from "react";

import { schedule } from "@/config/site";
import { cn } from "@/lib/utils";

export function ScheduleAccordion() {
  const [open, setOpen] = useState(0);
  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-14 border-y border-[var(--line)]">
      {schedule.map((week, index) => {
        const active = open === index;
        const panelId = `schedule-panel-${index}`;
        const buttonId = `schedule-button-${index}`;

        return (
          <div key={week.title} className="border-b border-[var(--line)] last:border-b-0">
            <button
              id={buttonId}
              type="button"
              className="grid w-full grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-6 text-left sm:grid-cols-[7rem_1fr_auto] sm:py-8"
              aria-expanded={active}
              aria-controls={panelId}
              onClick={() => setOpen(active ? -1 : index)}
            >
              <span className="eyebrow">Week 0{index + 1}</span>
              <span className="font-[var(--font-display)] text-[clamp(1.35rem,3vw,2.8rem)] leading-none">
                {week.title}
              </span>
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center border border-[var(--line)] transition",
                  active && "rotate-180 border-[var(--green-700)] text-[var(--green-700)]"
                )}
              >
                <ChevronDown size={18} aria-hidden="true" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {active ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.36, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <ul className="grid gap-px pb-8 sm:ml-28 sm:grid-cols-2">
                    {week.items.map((item) => (
                      <li key={item} className="border-t border-[var(--line)] py-3 pr-6 text-[var(--stone)]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
