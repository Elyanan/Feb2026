import Link from "next/link";

import { AnimatedSection, Reveal } from "@/components/motion/AnimatedSection";
import { qAndA, speakers } from "@/config/site";

export function LiveQASection() {
  return (
    <AnimatedSection id="qa" className="section-pad dark-panel overflow-hidden">
      <div className="container grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <Reveal>
          <div>
            <div className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </span>
              Live industry Q&A
            </div>
            <h2 className="h2 mt-5 max-w-3xl">Ask the people who work in the industry.</h2>
            <p className="lead mt-6 max-w-2xl text-white/72">
              Have questions about banking? Careers? Finance? Markets? What it is actually like
              working in the industry?
            </p>
            <p className="lead mt-2 max-w-2xl text-white/72">This is your opportunity to ask.</p>
            <Link href="#speakerQuestion" className="btn btn-primary mt-9 bg-white text-[var(--forest)] hover:bg-emerald-100">
              Ask your question
            </Link>
          </div>
        </Reveal>

        <Reveal>
          <div className="border border-white/14 bg-white/[0.035] p-5 backdrop-blur">
            <div className="grid gap-px overflow-hidden bg-white/12 sm:grid-cols-2">
              {qAndA.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="min-h-40 bg-[var(--forest)]/80 p-5">
                    <Icon className="text-emerald-200" size={24} strokeWidth={1.7} />
                    <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-white/52">
                      {item.label}
                    </p>
                    <p className="mt-2 font-[var(--font-display)] text-2xl leading-tight">{item.text}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 grid gap-px bg-white/12">
              {speakers.map((speaker) => (
                <div key={speaker.role} className="flex items-center justify-between bg-white/[0.04] p-4">
                  <span className="font-[var(--font-display)] text-2xl">{speaker.role}</span>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
                    Surprise guest
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </AnimatedSection>
  );
}
