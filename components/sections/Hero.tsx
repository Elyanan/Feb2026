"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import Link from "next/link";

import { heroTerms, site } from "@/config/site";
import { MarketBackground } from "@/components/sections/MarketBackground";

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export function Hero() {
  const reduceMotion = useReducedMotion();
  const itemVariants: Variants = reduceMotion ? {
    hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0, transition: { duration: 0 } }
  } : item;

  return (
    <section className="mesh-bg relative min-h-[100svh] overflow-hidden pt-28">
      <MarketBackground />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--background)] to-transparent" />
      <motion.div
        className="container relative z-10 grid min-h-[calc(100svh-7rem)] items-center gap-12 pb-20 pt-14 lg:grid-cols-[minmax(0,1fr)_360px]"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12, delayChildren: reduceMotion ? 0 : 0.15 } }
        }}
      >
        <div>
          <motion.p variants={itemVariants} className="eyebrow">
            {site.name} {site.year} / {site.fullName}
          </motion.p>
          <motion.h1 variants={itemVariants} className="display mt-6 max-w-5xl">
            Find what makes finance click for you.
          </motion.h1>
          <motion.p variants={itemVariants} className="lead mt-8 max-w-2xl">
            FEB is a weekly program that sparks curiosity about banking, economics, finance, and
            business, and helps you discover the path you are passionate about. Presentations,
            discussions, and conversations with professionals who work in the industry.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="#apply" className="btn btn-primary">
              Apply for the program <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="#about" className="btn btn-secondary">
              Explore the program
            </Link>
          </motion.div>
        </div>

        <motion.aside
          variants={itemVariants}
          className="hidden border-l border-[var(--line)] pl-8 lg:block"
          aria-label="Market terms"
        >
          <div className="grid gap-3">
            {heroTerms.map((term, index) => (
              <motion.div
                key={term}
                className="flex items-center justify-between border-b border-[var(--line)] py-4"
                animate={reduceMotion ? { opacity: 1 } : { opacity: [0.48, 1, 0.48] }}
                transition={{ duration: reduceMotion ? 0 : 3, delay: reduceMotion ? 0 : index * 0.3, repeat: reduceMotion ? 0 : Infinity }}
              >
                <span className="text-xs font-bold tracking-[0.18em] text-[var(--stone)]">{term}</span>
                <span className="font-mono text-sm text-[var(--green-700)]">
                  +{(1.8 + index * 0.47).toFixed(2)}%
                </span>
              </motion.div>
            ))}
          </div>
        </motion.aside>
      </motion.div>

      <div className="absolute inset-x-0 bottom-7 z-10">
        <div className="container flex flex-wrap items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.15em] text-[var(--stone)]">
          <span>{site.tagline}</span>
          <Link href="#why" className="inline-flex items-center gap-2">
            Beginners welcome <ChevronDown size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
